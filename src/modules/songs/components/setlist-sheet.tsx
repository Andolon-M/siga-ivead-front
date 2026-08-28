import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  ListMusic,
  Search,
  Music,
  Play,
  Calendar,
} from 'lucide-react';
import type { MeetingSessionSongItem } from '@/modules/services/types';
import { MUSICAL_KEY_SHORT } from '../utils/chord-transposer';

interface SetlistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionSongs: MeetingSessionSongItem[];
  currentSongId?: string;
  sessionTitle?: string;
  sessionDate?: string;
  onSelectSong: (songId: string) => void;
  container?: HTMLElement | null;
}

export function SetlistSheet({
  open,
  onOpenChange,
  sessionSongs,
  currentSongId,
  sessionTitle,
  sessionDate,
  onSelectSong,
  container,
}: SetlistSheetProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Formato de fecha legible
  const formattedSessionDate = useMemo(() => {
    if (!sessionDate) return '';
    try {
      const datePart = sessionDate.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return new Date(sessionDate).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return sessionDate;
    }
  }, [sessionDate]);

  // Filtrar canciones según el término de búsqueda
  const filteredSongs = useMemo(() => {
    if (!searchTerm.trim()) return sessionSongs;
    const term = searchTerm.toLowerCase().trim();
    return sessionSongs.filter((item) => {
      const title = item.song?.title?.toLowerCase() || '';
      const artist = item.song?.artist?.toLowerCase() || '';
      const artistRel = item.song?.artist_rel?.name?.toLowerCase() || '';
      return title.includes(term) || artist.includes(term) || artistRel.includes(term);
    });
  }, [sessionSongs, searchTerm]);

  const currentIndex = useMemo(() => {
    return sessionSongs.findIndex((s) => s.song_id === currentSongId || s.song?.id === currentSongId);
  }, [sessionSongs, currentSongId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        container={container}
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l shadow-2xl z-[120]"
      >
        {/* Cabecera del panel */}
        <SheetHeader className="p-4 sm:p-5 border-b bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ListMusic className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base sm:text-lg font-bold truncate">
                {sessionTitle || 'Repertorio del Culto'}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                {formattedSessionDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedSessionDate}
                  </span>
                )}
                {formattedSessionDate && <span>•</span>}
                <span>{sessionSongs.length} canciones</span>
              </SheetDescription>
            </div>
          </div>

          {/* Buscador rápido de canciones */}
          {sessionSongs.length > 4 && (
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar canción en el repertorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          )}
        </SheetHeader>

        {/* Lista de Canciones */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No se encontraron canciones en el repertorio.
            </div>
          ) : (
            filteredSongs.map((item) => {
              const originalIndex = sessionSongs.findIndex((s) => s.id === item.id);
              const isCurrent =
                item.song_id === currentSongId || item.song?.id === currentSongId;
              const isNext = originalIndex === currentIndex + 1;
              const keyDisplay = item.song?.original_key
                ? MUSICAL_KEY_SHORT[item.song.original_key] || item.song.original_key
                : null;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSong(item.song_id);
                    onOpenChange(false);
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 select-none group ${
                    isCurrent
                      ? 'bg-primary/10 dark:bg-primary/15 border-primary shadow-xs ring-1 ring-primary/30'
                      : 'bg-card hover:bg-muted/60 border-border/70 hover:border-border'
                  }`}
                >
                  {/* Número de orden o indicador de estado */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground shadow-xs animate-pulse'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/20'
                    }`}
                  >
                    {originalIndex + 1}
                  </div>

                  {/* Detalles de la canción */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {item.song?.title || 'Canción sin título'}
                      </h4>

                      {isCurrent && (
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 py-0 h-4 bg-primary shrink-0"
                        >
                          En vivo
                        </Badge>
                      )}

                      {isNext && !isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shrink-0"
                        >
                          Siguiente
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">
                        {item.song?.artist_rel?.name || item.song?.artist || 'Autor desconocido'}
                      </span>

                      {keyDisplay && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-primary text-[11px]">
                            {keyDisplay}
                          </span>
                        </>
                      )}

                      {item.song?.bpm && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px]">
                            {item.song.bpm} BPM
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="shrink-0 text-muted-foreground group-hover:text-primary">
                    <Play className={`h-4 w-4 ${isCurrent ? 'text-primary fill-primary' : 'opacity-40 group-hover:opacity-100'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del panel con atajos / información */}
        <div className="p-3 border-t bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Usa las flechas ◀ ▶ para cambiar rápido</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
