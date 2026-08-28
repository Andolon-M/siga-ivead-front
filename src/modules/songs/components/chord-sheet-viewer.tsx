import React, { useMemo } from 'react';
import { parseSongLines } from '../utils/chord-transposer';

interface ChordSheetViewerProps {
  content: string;
  showChords?: boolean;
  fontSize?: number; // Tamaño en px, default: 16
  columns?: 1 | 2 | 3;
  className?: string;
}

export function ChordSheetViewer({
  content,
  showChords = true,
  fontSize = 16,
  columns = 1,
  className = '',
}: ChordSheetViewerProps) {
  const lines = useMemo(() => parseSongLines(content), [content]);

  // Clase de columnas para Tailwind
  const columnClasses = {
    1: 'columns-1',
    2: 'columns-1 md:columns-2 gap-8 [column-rule:1px_solid_var(--border)]',
    3: 'columns-1 md:columns-2 lg:columns-3 gap-6 [column-rule:1px_solid_var(--border)]',
  }[columns];

  return (
    <div
      className={`font-sans select-text leading-relaxed ${columnClasses} ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, lineIdx) => {
        // 1. Línea vacía
        if (line.isEmpty) {
          return <div key={lineIdx} className="h-4 break-inside-avoid" />;
        }

        // 2. Encabezado de sección ([Intro], [Coro], [Verso 1], etc.)
        if (line.isSectionHeader && line.sectionName) {
          return (
            <div
              key={lineIdx}
              className="mt-4 mb-2 pt-2 first:mt-0 font-bold uppercase tracking-wider text-xs text-primary/90 flex items-center gap-2 border-b border-border/50 pb-1 break-inside-avoid"
            >
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {line.sectionName}
              </span>
            </div>
          );
        }

        // 3. Comentarios
        if (line.isComment) {
          return (
            <div
              key={lineIdx}
              className="text-xs text-muted-foreground italic my-1 break-inside-avoid"
            >
              {line.blocks[0]?.text}
            </div>
          );
        }

        // 4. Línea con bloques de acordes y texto
        return (
          <div
            key={lineIdx}
            className="flex flex-wrap items-end min-h-[1.75em] break-inside-avoid my-0.5 leading-none"
          >
            {line.blocks.map((block, blockIdx) => (
              <span
                key={blockIdx}
                className="inline-flex flex-col align-bottom whitespace-pre"
              >
                {/* Fila del Acorde */}
                {showChords && (
                  <span
                    className={`font-mono font-bold text-primary tracking-tight h-[1.2em] leading-none select-none text-[0.85em] ${
                      !block.chord ? 'invisible' : ''
                    }`}
                  >
                    {block.chord || '\u00A0'}
                  </span>
                )}
                {/* Fila de la Letra */}
                <span className="leading-normal text-foreground">
                  {block.text || '\u00A0'}
                </span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
