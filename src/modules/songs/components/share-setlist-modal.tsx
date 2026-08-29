import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Share2,
  Copy,
  Check,
  Send,
  Printer,
  QrCode,
  Sparkles,
  ExternalLink,
  MessageCircle,
  FileText,
  Calendar,
  Music,
} from 'lucide-react';
import type { MeetingSessionSongItem, MeetingSession } from '@/modules/services/types';
import { MUSICAL_KEY_SHORT, transposeSongContent } from '../utils/chord-transposer';

interface ShareSetlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: MeetingSession | null;
  sessionSongs: MeetingSessionSongItem[];
  sessionId: string;
}

export function ShareSetlistModal({
  open,
  onOpenChange,
  session,
  sessionSongs,
  sessionId,
}: ShareSetlistModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // URL pública directa
  const publicUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/p/setlist/${sessionId}`;
  }, [sessionId]);

  const sessionTitle = session?.recurring_meetings?.name || 'Repertorio del Culto';

  const formattedDate = useMemo(() => {
    if (!session?.session_date) return '';
    try {
      const datePart = session.session_date.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return new Date(session.session_date).toLocaleDateString('es-CO');
    } catch {
      return session.session_date;
    }
  }, [session?.session_date]);

  // Mensaje estructurado con formato enriquecido para WhatsApp
  const whatsappMessage = useMemo(() => {
    const lines: string[] = [];
    lines.push(`✝️ *${sessionTitle.toUpperCase()}* ✝️`);
    if (formattedDate) {
      lines.push(`📅 *Fecha:* ${formattedDate}`);
    }
    lines.push(`🎵 *Repertorio (${sessionSongs.length} Canciones):*\n`);

    sessionSongs.forEach((item, index) => {
      const title = item.song?.title || `Canción ${index + 1}`;
      const artist = item.song?.artist_rel?.name || item.song?.artist || '';
      const key = item.song?.original_key
        ? ` [Tono: ${MUSICAL_KEY_SHORT[item.song.original_key] || item.song.original_key}]`
        : '';
      const bpm = item.song?.bpm ? ` (${item.song.bpm} BPM)` : '';

      lines.push(`*${index + 1}.* 🎶 *${title}*${artist ? ` - _${artist}_` : ''}${key}${bpm}`);

      if (item.song?.youtube_url) {
        lines.push(`   ▶️ *Video/Audio:* ${item.song.youtube_url}`);
      }
    });

    lines.push(`\n📱 *Ver letras completas y cantar desde el celular:*`);
    lines.push(`👉 ${publicUrl}`);

    return lines.join('\n');
  }, [sessionTitle, formattedDate, sessionSongs, publicUrl]);

  // Copiar link al portapapeles
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copiar texto del mensaje de WhatsApp
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Enviar directamente a WhatsApp
  const handleSendWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  // Generar e imprimir Cancionero Consolidado en PDF
  const handlePrintConsolidatedPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite abrir ventanas emergentes para generar el PDF');
      return;
    }

    const songsHtml = sessionSongs
      .map((item, index) => {
        const title = item.song?.title || `Canción ${index + 1}`;
        const artist = item.song?.artist_rel?.name || item.song?.artist || '';
        const key = item.song?.original_key
          ? MUSICAL_KEY_SHORT[item.song.original_key] || item.song.original_key
          : '';
        const bpm = item.song?.bpm ? `${item.song.bpm} BPM` : '';

        // Formatear letra limpia
        const contentLines = (item.song?.content || '')
          .split('\n')
          .filter((line) => !line.trim().startsWith('.')) // Quitar líneas de acordes para lectura limpia de cantantes
          .join('\n');

        return `
        <div class="song-block">
          <div class="song-header">
            <span class="song-num">${index + 1}</span>
            <div class="song-info">
              <h2 class="song-title">${title}</h2>
              <div class="song-meta">
                ${artist ? `<span class="artist">${artist}</span>` : ''}
                ${key ? `<span class="badge">Tono: ${key}</span>` : ''}
                ${bpm ? `<span class="badge">${bpm}</span>` : ''}
              </div>
            </div>
          </div>
          <pre class="song-content">${contentLines}</pre>
        </div>
      `;
      })
      .join('<div class="page-break"></div>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cancionero - ${sessionTitle}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: letter portrait;
            margin: 1.5cm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #111;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 13pt;
            line-height: 1.45;
          }
          .cover {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .cover h1 {
            margin: 0;
            font-size: 22pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cover p {
            margin: 5px 0 0;
            color: #555;
            font-size: 11pt;
          }
          .song-block {
            margin-bottom: 30px;
            break-inside: avoid;
          }
          .song-header {
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .song-num {
            background: #111;
            color: #fff;
            font-weight: bold;
            font-size: 12pt;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .song-title {
            margin: 0;
            font-size: 15pt;
            font-weight: bold;
          }
          .song-meta {
            font-size: 9pt;
            color: #64748b;
            display: flex;
            gap: 10px;
            margin-top: 2px;
          }
          .song-content {
            font-family: inherit;
            white-space: pre-wrap;
            margin: 0;
            font-size: 11.5pt;
            line-height: 1.5;
            color: #1e293b;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>${sessionTitle}</h1>
          <p>IVEAD Alabanza • ${formattedDate || ''} • ${sessionSongs.length} Canciones</p>
        </div>
        ${songsHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicUrl
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-lg p-5 sm:p-6 rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-xl bg-primary/10">
              <Share2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold">
              Compartir Repertorio del Culto
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Enlace público directo y sin contraseñas para que las hermanas y el equipo puedan abrir las canciones y ensayar en 1 solo clic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Botón Principal: Compartir a WhatsApp */}
          <Button
            onClick={handleSendWhatsApp}
            size="lg"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md gap-2.5 rounded-xl cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Compartir en WhatsApp</span>
          </Button>

          {/* Enlace Público con Botón Copiar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              Enlace Público (Sin login requerido):
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="font-mono text-xs bg-muted/40 select-all h-9"
              />
              <Button
                onClick={handleCopyLink}
                variant={copiedLink ? 'default' : 'outline'}
                size="sm"
                className="h-9 px-3 gap-1.5 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Opciones Adicionales: QR y Cancionero PDF */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold gap-1.5 rounded-xl"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="h-4 w-4 text-primary" />
              <span>{showQR ? 'Ocultar QR' : 'Mostrar Código QR'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold gap-1.5 rounded-xl"
              onClick={handlePrintConsolidatedPDF}
              title="Genera un PDF con todas las letras en orden"
            >
              <Printer className="h-4 w-4 text-primary" />
              <span>Cancionero PDF</span>
            </Button>
          </div>

          {/* Vista del Código QR */}
          {showQR && (
            <div className="p-4 bg-muted/40 rounded-2xl border flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-xs font-semibold text-center text-muted-foreground">
                Apunta la cámara del celular para abrir el repertorio
              </p>
              <div className="p-3 bg-white rounded-xl shadow-xs border">
                <img
                  src={qrImageUrl}
                  alt="Código QR del Repertorio"
                  className="w-44 h-44 object-contain"
                />
              </div>
            </div>
          )}

          {/* Vista Previa del Mensaje que se envía */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Vista previa del mensaje de WhatsApp:
              </span>
              <button
                onClick={handleCopyMessage}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Mensaje copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border text-xs font-mono whitespace-pre-wrap text-foreground max-h-40 overflow-y-auto leading-relaxed">
              {whatsappMessage}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default ShareSetlistModal;
