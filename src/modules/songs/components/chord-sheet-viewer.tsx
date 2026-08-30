import React, { useMemo } from 'react';
import { parseSongLines, filterVisibleSongLines, ParsedLine } from '../utils/chord-transposer';
import { normalizeSectionSlug } from '../types/live-sync.types';

interface ChordSheetViewerProps {
  content: string;
  showChords?: boolean;
  fontSize?: number; // Tamaño en px, default: 16
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
        // Si el bloque actual ya tiene líneas, guardarlo
        if (currentBlock.lines.length > 0 || currentBlock.name) {
          blocks.push(currentBlock);
        }

        const slug = normalizeSectionSlug(line.sectionName);
        currentBlock = {
          id: `song-section-${slug}-${blocks.length}`,
          name: line.sectionName,
          slug,
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

  return (
    <div className="w-full max-w-full overflow-x-auto pb-2">
      <div
        className={`font-mono select-text leading-relaxed min-w-fit ${columnClasses} ${className}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {sectionBlocks.map((block, blockIdx) => {
          const isActive =
            Boolean(activeSectionSlug && block.slug && (
              activeSectionSlug === block.slug ||
              activeSectionSlug.includes(block.slug) ||
              block.slug.includes(activeSectionSlug)
            )) ||
            Boolean(activeSectionName && block.name && (
              activeSectionName.toLowerCase().trim() === block.name.toLowerCase().trim()
            ));

          return (
            <div
              key={block.id || blockIdx}
              id={`song-section-${block.slug}`}
              data-section-slug={block.slug}
              data-section-name={block.name}
              onClick={() => block.name && onSectionClick?.(block.name, block.slug)}
              className={`rounded-xl transition-all duration-300 break-inside-avoid my-3 p-2 sm:p-3 ${
                isActive
                  ? 'bg-primary/10 dark:bg-primary/15 border-l-4 border-primary ring-1 ring-primary/30 shadow-sm'
                  : 'border-l-4 border-transparent hover:bg-muted/30'
              }`}
            >
              {block.lines.map((line, lineIdx) => {
                // 1. Línea vacía
                if (line.type === 'empty' || line.isEmpty) {
                  return <div key={lineIdx} className="h-3" />;
                }

                // 2. Encabezado de sección ([Intro], [Coro], [Verso 1], etc.)
                if ((line.type === 'section' || line.isSectionHeader) && line.sectionName) {
                  return (
                    <div
                      key={lineIdx}
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

                // 3. Comentarios
                if (line.type === 'comment' || line.isComment) {
                  return (
                    <div
                      key={lineIdx}
                      className="text-xs text-muted-foreground italic my-1 font-sans"
                    >
                      {line.text}
                    </div>
                  );
                }

                // 3.1. Línea de Notas / Melodía / Instrumental / Riff
                if (line.type === 'riff' || line.isRiffOrNotes) {
                  if (!showChords) return null;
                  return (
                    <div
                      key={lineIdx}
                      className="my-1.5 py-1 px-3 rounded-md bg-muted/50 border border-border/60 font-mono font-bold text-primary tracking-wider text-[0.9em] inline-block whitespace-pre"
                    >
                      {line.text}
                    </div>
                  );
                }

                // 4. Línea de Acordes
                if (line.type === 'chord') {
                  if (!showChords) return null;
                  return (
                    <div
                      key={lineIdx}
                      className={`font-mono font-bold whitespace-pre tracking-normal leading-tight select-text min-h-[1.25em] transition-colors ${
                        isActive ? 'text-primary' : 'text-primary/95'
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                }

                // 5. Línea de Letra Normal
                return (
                  <div
                    key={lineIdx}
                    className="font-mono text-foreground whitespace-pre tracking-normal leading-normal select-text min-h-[1.25em]"
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
