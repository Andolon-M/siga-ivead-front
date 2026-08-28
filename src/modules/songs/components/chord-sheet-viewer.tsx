import React, { useMemo } from 'react';
import { parseSongLines, filterVisibleSongLines } from '../utils/chord-transposer';

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
  fontSize = 18,
  columns = 1,
  className = '',
}: ChordSheetViewerProps) {
  const lines = useMemo(() => {
    const rawParsed = parseSongLines(content);
    return filterVisibleSongLines(rawParsed, showChords);
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
        {lines.map((line, lineIdx) => {
        // 1. Línea vacía
        if (line.type === 'empty' || line.isEmpty) {
          return <div key={lineIdx} className="h-4 break-inside-avoid" />;
        }

        // 2. Encabezado de sección ([Intro], [Coro], [Verso 1], [Todos puntos], etc.)
        if ((line.type === 'section' || line.isSectionHeader) && line.sectionName) {
          return (
            <div
              key={lineIdx}
              className="mt-4 mb-2 pt-2 first:mt-0 font-sans font-bold uppercase tracking-wider text-xs text-primary/90 flex items-center gap-2 border-b border-border/50 pb-1 break-inside-avoid"
            >
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {line.sectionName}
              </span>
            </div>
          );
        }

        // 3. Comentarios
        if (line.type === 'comment' || line.isComment) {
          return (
            <div
              key={lineIdx}
              className="text-xs text-muted-foreground italic my-1 font-sans break-inside-avoid"
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
              className="my-1.5 py-1 px-3 rounded-md bg-muted/50 border border-border/60 font-mono font-bold text-primary tracking-wider text-[0.9em] break-inside-avoid inline-block whitespace-pre"
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
              className="font-mono font-bold text-primary whitespace-pre tracking-normal leading-tight select-text break-inside-avoid min-h-[1.25em]"
            >
              {line.text}
            </div>
          );
        }

        // 5. Línea de Letra Normal
        return (
          <div
            key={lineIdx}
            className="font-mono text-foreground whitespace-pre tracking-normal leading-normal select-text break-inside-avoid min-h-[1.25em]"
          >
            {line.text}
          </div>
        );
      })}
      </div>
    </div>
  );
}
