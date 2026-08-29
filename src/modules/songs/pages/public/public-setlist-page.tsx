import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Music,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Youtube,
  ExternalLink,
  Calendar,
  ListMusic,
  Loader2,
  Share2,
  FileAudio,
  Sparkles,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { meetingsService } from '@/modules/services/services/meetings.service';
import type { PublicSetlistResponse, MeetingSessionSongItem } from '@/modules/services/types';
import { MUSICAL_KEY_SHORT, transposeSongContent } from '../../utils/chord-transposer';
import { ChordSheetViewer } from '../../components/chord-sheet-viewer';

export function PublicSetlistPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<PublicSetlistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Canción activa seleccionada por índice (0-based)
  const [activeSongIndex, setActiveSongIndex] = useState<number>(0);

  // Opciones de visualización
  const [showChords, setShowChords] = useState<boolean>(false); // Por defecto: Solo letra para cantantes
  const [fontSize, setFontSize] = useState<number>(18);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(true);

  // Gestos táctiles de deslizamiento horizontal (swipe) para cambiar de canción
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Cargar datos del repertorio público
  useEffect(() => {
    if (!sessionId) {
      setError('Enlace no válido. No se proporcionó el identificador del culto.');
      setIsLoading(false);
      return;
    }

    const loadPublicSetlist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await meetingsService.getPublicSetlist(sessionId);
        setData(result);
      } catch (err: any) {
        console.error('Error cargando repertorio público:', err);
        setError(
          err?.response?.data?.message ||
            'No se pudo encontrar el repertorio de este culto o el enlace ya no está disponible.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicSetlist();
  }, [sessionId]);

  const songs = useMemo(() => data?.songs || [], [data]);
  const session = useMemo(() => data?.session, [data]);

  const currentSongItem: MeetingSessionSongItem | null = useMemo(() => {
    if (songs.length === 0 || activeSongIndex < 0 || activeSongIndex >= songs.length) {
      return null;
    }
    return songs[activeSongIndex];
  }, [songs, activeSongIndex]);

  const currentSong = currentSongItem?.song;

  // Extraer ID de YouTube para reproducir directamente
  const youtubeVideoId = useMemo(() => {
    if (!currentSong?.youtube_url) return null;
    const match = currentSong.youtube_url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match ? match[1] : null;
  }, [currentSong?.youtube_url]);

  // Formato de fecha del culto
  const formattedDate = useMemo(() => {
    if (!session?.session_date) return '';
    try {
      const datePart = session.session_date.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return new Date(session.session_date).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return session.session_date;
    }
  }, [session?.session_date]);

  // Manejo de gestos táctiles (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activeSongIndex < songs.length - 1) {
        // Deslizar izquierda -> siguiente canción
        setActiveSongIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (deltaX > 0 && activeSongIndex > 0) {
        // Deslizar derecha -> canción anterior
        setActiveSongIndex((prev) => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-4">
        <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-inner animate-pulse">
          <Music className="h-10 w-10 animate-bounce" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">Cargando Cancionero del Culto...</h2>
          <p className="text-xs text-muted-foreground">Preparando letras y audios de referencia</p>
        </div>
      </div>
    );
  }

  if (error || !session || songs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
          <ListMusic className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">Repertorio no disponible</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error || 'No hay canciones asignadas a este culto todavía.'}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 pb-28 select-none"
    >
      {/* Encabezado Superior Fijo del Culto */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b shadow-xs">
        <div className="max-w-3xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="truncate">{session.meeting_name || 'Repertorio del Culto'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {formattedDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              )}
              <span>•</span>
              <span className="font-medium text-foreground">
                {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
              </span>
            </div>
          </div>

          {/* Controles Rápidos: Toggle Acordes y Zoom */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Acordes / Solo Letra */}
            <Button
              variant={showChords ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-2.5 text-xs gap-1 rounded-lg"
              onClick={() => setShowChords(!showChords)}
              title={showChords ? 'Cambiar a solo letra' : 'Mostrar acordes musicales'}
            >
              {showChords ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{showChords ? 'Acordes' : 'Solo Letra'}</span>
            </Button>

            {/* Zoom Letra */}
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded"
                onClick={() => setFontSize((prev) => Math.max(14, prev - 2))}
                disabled={fontSize <= 14}
                title="Letra más pequeña"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] font-mono font-semibold px-1 min-w-[20px] text-center">
                {fontSize}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded"
                onClick={() => setFontSize((prev) => Math.min(28, prev + 2))}
                disabled={fontSize >= 28}
                title="Letra más grande"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Carrusel / Barra Horizontal de Canciones del Culto */}
        <div className="border-t bg-muted/20 px-3 py-1.5 overflow-x-auto no-scrollbar">
          <div className="max-w-3xl mx-auto flex items-center gap-1.5">
            {songs.map((item, index) => {
              const isActive = index === activeSongIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSongIndex(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {item.song?.title || `Canción ${index + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 flex-1 w-full space-y-4">
        {currentSong && (
          <>
            {/* Título de la Canción y Datos */}
            <div className="bg-card border rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {activeSongIndex + 1}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                      {currentSong.title}
                    </h1>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground font-normal mt-1 ml-8 truncate">
                    {currentSong.artist_rel?.name || currentSong.artist || 'Autor desconocido'}
                  </p>
                </div>

                {/* Badges de ritmo / versión */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {currentSong.bpm && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 px-2 font-normal ${
                        currentSong.bpm >= 100
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {currentSong.bpm >= 100 ? '⚡ Rápida' : '🕊️ Lenta'} ({currentSong.bpm} BPM)
                    </Badge>
                  )}
                  {showChords && currentSong.original_key && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-2 font-mono font-bold text-primary">
                      Tono: {MUSICAL_KEY_SHORT[currentSong.original_key] || currentSong.original_key}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Reproductor de Audio / YouTube de Referencia (Para ensayar cantando) */}
            {youtubeVideoId && (
              <div className="bg-card border rounded-2xl overflow-hidden shadow-xs">
                <div
                  onClick={() => setIsVideoOpen(!isVideoOpen)}
                  className="p-3 bg-muted/40 flex items-center justify-between cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <Youtube className="h-4 w-4 shrink-0" />
                    <span>Video / Audio para Ensayar</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {isVideoOpen ? 'Ocultar video ▲' : 'Mostrar video ▼'}
                  </span>
                </div>

                {isVideoOpen && (
                  <div className="p-3 bg-card border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative h-[130px] w-full sm:w-[230px] shrink-0 rounded-xl overflow-hidden border bg-black shadow-inner">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title={`${currentSong.title} - Video Guía`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <p className="text-xs text-muted-foreground">
                        Dale play para escuchar la melodía guía mientras sigues la letra abajo.
                      </p>
                      <a
                        href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1 w-fit"
                      >
                        <span>Abrir en la app de YouTube</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notas del arreglo si existen */}
            {currentSong.notes && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold uppercase tracking-wider block mb-0.5">Notas del Arreglo:</span>
                {currentSong.notes}
              </div>
            )}

            {/* Visor de la Letra */}
            <Card className="shadow-xs overflow-hidden rounded-2xl border">
              <CardContent className="p-4 sm:p-6 overflow-x-auto">
                <ChordSheetViewer
                  content={currentSong.content}
                  showChords={showChords}
                  fontSize={fontSize}
                  columns={1}
                />
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Barra Fija Inferior de Navegación Rápida */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t p-2.5 shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {/* Botón Canción Anterior */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 gap-1 text-xs font-semibold rounded-xl flex-1 sm:flex-initial"
            onClick={() => {
              if (activeSongIndex > 0) {
                setActiveSongIndex((prev) => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            disabled={activeSongIndex === 0}
            title="Canción anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="truncate">
              {activeSongIndex > 0 ? songs[activeSongIndex - 1]?.song?.title : 'Anterior'}
            </span>
          </Button>

          {/* Indicador central de posición */}
          <div className="text-center px-2 shrink-0">
            <span className="text-xs font-bold font-mono text-primary block leading-none">
              {activeSongIndex + 1} / {songs.length}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
              Desliza ◀ ▶
            </span>
          </div>

          {/* Botón Siguiente Canción */}
          <Button
            variant="default"
            size="sm"
            className="h-10 px-3.5 gap-1 text-xs font-semibold bg-primary text-primary-foreground rounded-xl flex-1 sm:flex-initial"
            onClick={() => {
              if (activeSongIndex < songs.length - 1) {
                setActiveSongIndex((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            disabled={activeSongIndex >= songs.length - 1}
            title="Siguiente canción"
          >
            <span className="truncate">
              {activeSongIndex < songs.length - 1
                ? songs[activeSongIndex + 1]?.song?.title
                : 'Final'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
export default PublicSetlistPage;
