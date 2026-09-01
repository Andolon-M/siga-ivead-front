import React, { useMemo } from 'react';
import { parseSongLines, filterVisibleSongLines } from '../utils/chord-transposer';
import type { ParsedLine } from '../types';
import { getCanonicalSectionKey } from '../types/live-sync.types';

interface ChordSheetViewerProps {
  content: string;
  showChords?: boolean;
  fontSize?: number; // Tamaño en px, default: 18
  columns?: 1 | 2 | 3;
  className?: string;
  activeSectionSlug?: string;
  activeSectionName?: string;
  onSectionClick?: (sectionName: string, sectionSlug: string) => void;
}

interface SectionBlock {
  id: string;
  name: string;
  slug: string;
  lines: ParsedLine[];
}

export interface ChordLyricChunk {
  chord: string;
  lyric: string;
}

interface ProcessedLinePair {
  type: 'pair';
  chunks: ChordLyricChunk[];
}

interface ProcessedSingleLine {
  type: 'single';
  line: ParsedLine;
}

type ProcessedBlockItem = ProcessedLinePair | ProcessedSingleLine;

/**
 * Empareja una línea de acordes y una línea de letra en unidades atómicas (chunks)
 * para que al hacer salto de línea responsivo en móvil, el acorde viaje siempre
 * junto con su palabra/sílaba sin descuadrarse, preservando la separación original
 * de los acordes de paso.
 */
function createChordLyricChunks(chordText: string, lyricText: string): ChordLyricChunk[] {
  const chordRegex = /\S+/g;
  const chords: { chord: string; index: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = chordRegex.exec(chordText)) !== null) {
    chords.push({
      chord: match[0],
      index: match.index,
    });
  }

  if (chords.length === 0) {
    return splitTextIntoWordChunks('', lyricText);
  }

  const rawChunks: ChordLyricChunk[] = [];

  // Letra previa o espacios antes del primer acorde
  if (chords[0].index > 0) {
    const preText = lyricText.slice(0, chords[0].index);
    if (preText) {
      rawChunks.push(...splitTextIntoWordChunks('', preText));
    } else {
      const spaces = chordText.slice(0, chords[0].index);
      rawChunks.push({ chord: '', lyric: spaces });
    }
  }

  for (let i = 0; i < chords.length; i++) {
    const current = chords[i];
    const next = chords[i + 1];

    // Espacio en caracteres que ocupa este acorde hasta el siguiente
    const chordSpan = next
      ? next.index - current.index
      : Math.max(current.chord.length + 1, chordText.length - current.index);

    const sliceEnd = next ? next.index : Math.max(lyricText.length, current.index + chordSpan);
    let slice = lyricText.slice(current.index, sliceEnd);

    // Si el texto de la letra es más corto que la distancia al siguiente acorde (acordes de paso o silencios)
    if (slice.length < chordSpan) {
      // Rellenar con espacios exactos para preservar la distancia musical entre acordes
      slice = slice.padEnd(chordSpan, ' ');
    }

    rawChunks.push(...splitTextIntoWordChunks(current.chord, slice));
  }

  return rawChunks;
}

/**
 * Subdivide un fragmento de letra en palabras para permitir wrapping fluido en espacios
 */
function splitTextIntoWordChunks(chord: string, textSlice: string): ChordLyricChunk[] {
  if (!textSlice) {
    return [{ chord, lyric: chord ? '  ' : '' }];
  }

  // Si solo contiene espacios en blanco (acordes de paso sobre silencios)
  if (/^\s+$/.test(textSlice)) {
    return [{ chord, lyric: textSlice }];
  }

  // Separar respetando espacios
  const tokens = textSlice.split(/(\s+)/);
  const result: ChordLyricChunk[] = [];
  let chordAssigned = false;

  let currentWord = '';
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    currentWord += token;

    // Si el token actual es un espacio en blanco o es el último
    if (/^\s+$/.test(token) || i === tokens.length - 1) {
      result.push({
        chord: !chordAssigned ? chord : '',
        lyric: currentWord,
      });
      chordAssigned = true;
      currentWord = '';
    }
  }

  if (currentWord) {
    result.push({
      chord: !chordAssigned ? chord : '',
      lyric: currentWord,
    });
  }

  return result.length > 0 ? result : [{ chord, lyric: textSlice }];
}

/**
 * Procesa las líneas de una sección identificando parejas (Acorde + Letra)
 */
function processSectionLines(lines: ParsedLine[]): ProcessedBlockItem[] {
  const items: ProcessedBlockItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Si encontramos una línea de acordes y la siguiente es una línea de letra
    if (line.type === 'chord' && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const isNextLyrics =
        nextLine.type === 'lyrics' ||
        (!nextLine.type &&
          !nextLine.isSectionHeader &&
          !nextLine.isEmpty &&
          !nextLine.isComment &&
          !nextLine.isRiffOrNotes);

      if (isNextLyrics) {
        const chunks = createChordLyricChunks(line.text, nextLine.text);
        items.push({
          type: 'pair',
          chunks,
        });
        i++; // Consumir la línea de letra emparejada
        continue;
      }
    }

    items.push({
      type: 'single',
      line,
    });
  }

  return items;
}

export function ChordSheetViewer({
  content,
  showChords = true,
  fontSize = 18,
  columns = 1,
  className = '',
  activeSectionSlug,
  activeSectionName,
  onSectionClick,
}: ChordSheetViewerProps) {
  // Parsear y agrupar las líneas en bloques de sección
  const sectionBlocks = useMemo(() => {
    const rawParsed = parseSongLines(content);
    const visibleLines = filterVisibleSongLines(rawParsed, showChords);

    const blocks: SectionBlock[] = [];
    let currentBlock: SectionBlock = {
      id: 'section-start',
      name: '',
      slug: 'start',
      lines: [],
    };

    for (let i = 0; i < visibleLines.length; i++) {
      const line = visibleLines[i];

      if ((line.type === 'section' || line.isSectionHeader) && line.sectionName) {
        if (currentBlock.lines.length > 0 || currentBlock.name) {
          blocks.push(currentBlock);
        }

        const key = getCanonicalSectionKey(line.sectionName);
        currentBlock = {
          id: `song-section-${key}-${blocks.length}`,
          name: line.sectionName,
          slug: key,
          lines: [line],
        };
      } else {
        currentBlock.lines.push(line);
      }
    }

    if (currentBlock.lines.length > 0 || currentBlock.name) {
      blocks.push(currentBlock);
    }

    return blocks;
  }, [content, showChords]);

  // Clase de columnas para Tailwind
  const columnClasses = {
    1: 'columns-1',
    2: 'columns-1 md:columns-2 gap-8 [column-rule:1px_solid_var(--border)]',
    3: 'columns-1 md:columns-2 lg:columns-3 gap-6 [column-rule:1px_solid_var(--border)]',
  }[columns];

  const targetKey = getCanonicalSectionKey(activeSectionSlug || activeSectionName || '');

  return (
    <div className="w-full max-w-full overflow-x-auto pb-2">
      <div
        className={`font-mono select-text leading-relaxed w-full ${columnClasses} ${className}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {sectionBlocks.map((block, blockIdx) => {
          const blockKey = getCanonicalSectionKey(block.name || block.slug);
          const isActive = Boolean(
            targetKey && blockKey && (
              targetKey === blockKey ||
              (targetKey === 'coro1' && blockKey === 'coro') ||
              (targetKey === 'coro' && blockKey === 'coro1') ||
              (targetKey === 'puente1' && blockKey === 'puente') ||
              (targetKey === 'puente' && blockKey === 'puente1')
            )
          );

          // Procesar las líneas del bloque en parejas o elementos individuales
          const processedItems = processSectionLines(block.lines);

          return (
            <div
              key={block.id || blockIdx}
              id={`song-section-${blockKey}`}
              data-section-key={blockKey}
              data-section-slug={blockKey}
              data-section-name={block.name}
              onClick={() => block.name && onSectionClick?.(block.name, blockKey)}
              className={`rounded-xl transition-all duration-300 break-inside-avoid my-3 p-2 sm:p-3 ${
                isActive
                  ? 'bg-primary/10 dark:bg-primary/15 border-l-4 border-primary ring-1 ring-primary/30 shadow-sm'
                  : 'border-l-4 border-transparent hover:bg-muted/30'
              }`}
            >
              {processedItems.map((item, itemIdx) => {
                // 1. Pareja Acorde + Letra (Responsive Auto-Wrapping)
                if (item.type === 'pair') {
                  return (
                    <div
                      key={itemIdx}
                      className="flex flex-wrap items-end my-1 font-mono leading-tight max-w-full select-text"
                    >
                      {item.chunks.map((chunk, cIdx) => (
                        <span key={cIdx} className="inline-flex flex-col justify-end shrink-0 select-text">
                          {showChords && (
                            <span
                              className={`font-bold font-mono text-[0.88em] leading-none pb-1 select-text transition-colors ${
                                isActive ? 'text-primary' : 'text-primary/95'
                              }`}
                              style={{ minHeight: '1.2em' }}
                            >
                              {chunk.chord || '\u00A0'}
                            </span>
                          )}
                          <span className="text-foreground leading-normal whitespace-pre select-text font-mono">
                            {chunk.lyric || (showChords && chunk.chord ? '\u00A0'.repeat(Math.max(1, chunk.chord.length)) : '')}
                          </span>
                        </span>
                      ))}
                    </div>
                  );
                }

                // 2. Elemento Individual
                const line = item.line;

                // 2.1 Línea vacía
                if (line.type === 'empty' || line.isEmpty) {
                  return <div key={itemIdx} className="h-3" />;
                }

                // 2.2 Encabezado de sección ([Intro], [Coro], [Verso 1], etc.)
                if ((line.type === 'section' || line.isSectionHeader) && line.sectionName) {
                  return (
                    <div
                      key={itemIdx}
                      className="mb-2 pt-0.5 font-sans font-bold uppercase tracking-wider text-xs flex items-center justify-between border-b border-border/50 pb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground font-extrabold shadow-xs'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}
                        >
                          {line.sectionName}
                        </span>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-1.5 text-[10px] text-primary font-semibold lowercase tracking-normal">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          <span>en vivo</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // 2.3 Comentarios
                if (line.type === 'comment' || line.isComment) {
                  return (
                    <div
                      key={itemIdx}
                      className="text-xs text-muted-foreground italic my-1 font-sans"
                    >
                      {line.text}
                    </div>
                  );
                }

                // 2.4 Línea de Notas / Melodía / Instrumental / Riff
                if (line.type === 'riff' || line.isRiffOrNotes) {
                  if (!showChords) return null;
                  return (
                    <div
                      key={itemIdx}
                      className="my-1.5 py-1 px-3 rounded-md bg-muted/50 border border-border/60 font-mono font-bold text-primary tracking-wider text-[0.9em] inline-block whitespace-pre overflow-x-auto max-w-full"
                    >
                      {line.text}
                    </div>
                  );
                }

                // 2.5 Línea de Acordes Suelta (ej. Instrumental: C G Am F sin letra debajo)
                if (line.type === 'chord') {
                  if (!showChords) return null;
                  return (
                    <div
                      key={itemIdx}
                      className={`font-mono font-bold whitespace-pre-wrap tracking-normal leading-tight select-text min-h-[1.25em] transition-colors ${
                        isActive ? 'text-primary' : 'text-primary/95'
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                }

                // 2.6 Línea de Letra Suelta (sin acordes arriba)
                return (
                  <div
                    key={itemIdx}
                    className="font-mono text-foreground whitespace-pre-wrap tracking-normal leading-normal select-text min-h-[1.25em]"
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

