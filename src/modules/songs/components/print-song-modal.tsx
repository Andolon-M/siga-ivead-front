import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Switch } from '@/shared/components/ui/switch';
import { Slider } from '@/shared/components/ui/slider';
import { Printer, Eye } from 'lucide-react';
import type { Song } from '../types';
import { ChordSheetViewer } from './chord-sheet-viewer';
import { MUSICAL_KEY_SHORT, parseSongLines } from '../utils/chord-transposer';

interface PrintSongModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: Song;
  currentContent: string;
  currentKey: string;
}

export function PrintSongModal({
  open,
  onOpenChange,
  song,
  currentContent,
  currentKey,
}: PrintSongModalProps) {
  const [showChords, setShowChords] = useState(true);
  const [columns, setColumns] = useState<1 | 2 | 3>(2);
  const [fontSize, setFontSize] = useState(14);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para imprimir.');
      return;
    }

    const lines = parseSongLines(currentContent);

    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const generatedBody = lines
      .map((line) => {
        if (line.isEmpty) {
          return '<div style="height: 12px; margin: 0; padding: 0;"></div>';
        }
        if (line.isSectionHeader && line.sectionName) {
          return `<div class="section-badge">${escapeHtml(line.sectionName)}</div>`;
        }
        if (line.isComment) {
          return `<div class="comment">${escapeHtml(line.blocks[0]?.text || '')}</div>`;
        }

        const blocksHtml = line.blocks
          .map((b) => {
            const chordHtml =
              showChords && b.chord
                ? `<span class="chord">${escapeHtml(b.chord)}</span>`
                : showChords
                ? '<span class="chord-empty">&nbsp;</span>'
                : '';
            const textHtml = `<span class="lyric">${b.text ? escapeHtml(b.text) : '&nbsp;'}</span>`;
            return `<span class="chord-block">${chordHtml}${textHtml}</span>`;
          })
          .join('');

        return `<div class="line-row">${blocksHtml}</div>`;
      })
      .join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(song.title)} - ${escapeHtml(song.artist)}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: letter portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 0;
              font-size: ${fontSize}px;
              line-height: 1.3;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 6px;
              margin-bottom: 14px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .title {
              font-size: 20px;
              font-weight: 800;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            .artist {
              font-size: 13px;
              color: #475569;
              font-weight: 600;
              margin-top: 2px;
            }
            .meta {
              text-align: right;
              font-size: 11px;
              color: #334155;
              display: flex;
              gap: 8px;
              align-items: center;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              font-weight: bold;
            }
            .song-sheet {
              column-count: ${columns};
              column-gap: 32px;
              column-rule: 1px solid #cbd5e1;
              width: 100%;
            }
            .line-row {
              display: flex;
              flex-wrap: wrap;
              align-items: flex-end;
              margin: 2px 0;
              line-height: 1;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .chord-block {
              display: inline-flex;
              flex-direction: column;
              vertical-align: bottom;
              white-space: pre;
            }
            .chord {
              font-family: "Courier New", Courier, monospace;
              font-weight: 700;
              color: #0f172a;
              font-size: 0.85em;
              line-height: 1.1;
              height: 1.15em;
              display: block;
            }
            .chord-empty {
              height: 1.15em;
              visibility: hidden;
              display: block;
            }
            .lyric {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              line-height: 1.25;
              display: block;
            }
            .section-badge {
              display: inline-block;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
              background: #f1f5f9;
              color: #0f172a;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid #cbd5e1;
              margin-top: 10px;
              margin-bottom: 3px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .comment {
              font-style: italic;
              font-size: 0.85em;
              color: #64748b;
              margin: 2px 0;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${escapeHtml(song.title)}</h1>
              <div class="artist">${escapeHtml(song.artist)}</div>
            </div>
            <div class="meta">
              <span>Tono: <strong class="badge">${escapeHtml(currentKey)}</strong></span>
              ${song.bpm ? `<span>BPM: <strong class="badge">${song.bpm}</strong></span>` : ''}
              ${song.time_signature ? `<span>Compás: <strong class="badge">${escapeHtml(song.time_signature)}</strong></span>` : ''}
              ${song.version_type?.name ? `<span>Versión: <strong class="badge">${escapeHtml(song.version_type.name)}</strong></span>` : ''}
            </div>
          </div>
          <div class="song-sheet">
            ${generatedBody}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:max-w-[96vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] h-[92vh] flex flex-col p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Printer className="h-5 w-5 text-primary" />
            Imprimir Canción / Generar Hoja de Acordes
          </DialogTitle>
          <DialogDescription>
            Personaliza el formato, columnas y tamaño de letra para atril musical o coro
          </DialogDescription>
        </DialogHeader>

        {/* Barra de opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-muted/40 rounded-lg border">
          {/* Toggle Acordes */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="toggle-print-chords" className="text-sm font-medium">
              Incluir Acordes
            </Label>
            <Switch
              id="toggle-print-chords"
              checked={showChords}
              onCheckedChange={setShowChords}
            />
          </div>

          {/* Columnas */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Distribución de Columnas</Label>
            <RadioGroup
              value={String(columns)}
              onValueChange={(val) => setColumns(Number(val) as 1 | 2 | 3)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="1" id="col-1" />
                <Label htmlFor="col-1" className="text-xs">1 Columna</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="2" id="col-2" />
                <Label htmlFor="col-2" className="text-xs">2 Columnas</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="3" id="col-3" />
                <Label htmlFor="col-3" className="text-xs">3 Columnas</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tamaño de fuente */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-muted-foreground">Tamaño de Letra</Label>
              <span className="font-semibold">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              min={11}
              max={20}
              step={1}
              onValueChange={([val]) => setFontSize(val)}
            />
          </div>
        </div>

        {/* Vista previa en vivo */}
        <div className="flex-1 overflow-y-auto p-4 bg-background border rounded-lg shadow-inner">
          <div className="border-b pb-3 mb-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold uppercase">{song.title}</h2>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
            <div className="text-right text-xs space-x-2">
              <span className="px-2 py-1 bg-muted rounded border font-mono font-bold">
                Tono: {currentKey}
              </span>
              {song.bpm && (
                <span className="px-2 py-1 bg-muted rounded border font-mono">
                  BPM: {song.bpm}
                </span>
              )}
            </div>
          </div>

          <div id="printable-song-content">
            <ChordSheetViewer
              content={currentContent}
              showChords={showChords}
              fontSize={fontSize}
              columns={columns}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir Hoja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
