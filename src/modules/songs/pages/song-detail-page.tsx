import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Music,
  ArrowLeft,
  Edit2,
  Trash2,
  Printer,
  Youtube,
  FileAudio,
  Minus,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  Columns,
  ZoomIn,
  ZoomOut,
  Loader2,
  ExternalLink,
  Maximize,
  Minimize,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  SkipBack,
  SkipForward,
  ListMusic,
  MoreVertical,
  Share2,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { Can } from '@/shared/components/auth/can';
import type { Song, MusicalKey } from '../types';
import { songsService } from '../services/songs.service';
import { meetingsService } from '@/modules/services/services/meetings.service';
import type { MeetingSessionSongItem, MeetingSession } from '@/modules/services/types';
import {
  MUSICAL_KEY_SHORT,
  transposeSongContent,
  transposeChord,
} from '../utils/chord-transposer';
import { ChordSheetViewer } from '../components/chord-sheet-viewer';
import { PrintSongModal } from '../components/print-song-modal';
import { SetlistSheet } from '../components/setlist-sheet';
import { ShareSetlistModal } from '../components/share-setlist-modal';

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const mobileControlsRef = useRef<HTMLDivElement>(null);

  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialPrefLoaded = useRef<boolean>(false);

  // Estados de Setlist / Sesión de Culto (cuando se abre desde un servicio)
  const [sessionSongs, setSessionSongs] = useState<MeetingSessionSongItem[]>([]);
  const [currentSession, setCurrentSession] = useState<MeetingSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSetlistSheetOpen, setIsSetlistSheetOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Estados interactivos
  const [semitones, setSemitones] = useState<number>(0);
  const [showChords, setShowChords] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 13;
    }
    return 18;
  });
  const [columns, setColumns] = useState<1 | 2 | 3>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 1;
    }
    return 2;
  });
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState<boolean>(false);

  // Estado para colapsar / ocultar la barra flotante de navegación inferior deslizándola a la derecha
  const [isBottomNavCollapsed, setIsBottomNavCollapsed] = useState<boolean>(false);
  const bottomNavTouchStart = useRef<{ x: number; y: number } | null>(null);
  const bottomNavMouseStart = useRef<number | null>(null);

  // Estados de posicionamiento y arrastre de la burbuja flotante móvil
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('right');
  const [bubbleY, setBubbleY] = useState<number>(170);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragInfoRef = useRef<{ startX: number; startY: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialY: 170,
    moved: false,
  });

  // Gestos táctiles de deslizamiento (swipe horizontal) para cambiar canciones en móvil/tablet
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Sincronizar estado con evento nativo de pantalla completa (por ejemplo al pulsar tecla Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cerrar controles flotantes al hacer clic / tap fuera de ellos
  useEffect(() => {
    if (!isMobileControlsOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        mobileControlsRef.current &&
        !mobileControlsRef.current.contains(event.target as Node)
      ) {
        setIsMobileControlsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileControlsOpen]);

  // Manejo de arrastre (drag) libre de la burbuja (arriba / abajo / izquierda / derecha)
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragInfoRef.current.startX;
      const deltaY = clientY - dragInfoRef.current.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragInfoRef.current.moved = true;
      }

      // Desplazamiento vertical restringido a la ventana
      const newY = Math.max(70, Math.min(window.innerHeight - 80, dragInfoRef.current.initialY + deltaY));
      setBubbleY(newY);

      // Si se arrastra hacia la mitad opuesta de la pantalla, cambiar de lateral
      if (clientX < window.innerWidth / 2) {
        setBubbleSide('left');
      } else {
        setBubbleSide('right');
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  // Alternar pantalla completa
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (fullscreenContainerRef.current?.requestFullscreen) {
          await fullscreenContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error al alternar pantalla completa:', err);
    }
  };

  // Cargar canción y preferencias del usuario
  useEffect(() => {
    if (!id) return;

    const loadSongAndPreferences = async () => {
      setIsLoading(true);
      try {
        const [songData, prefData] = await Promise.all([
          songsService.getSongById(id),
          songsService.getUserPreference(id).catch(() => null),
        ]);

        setSong(songData);

        if (prefData) {
          if (typeof prefData.semitones === 'number') {
            setSemitones(prefData.semitones);
          }
          if (typeof prefData.font_size === 'number') {
            setFontSize(prefData.font_size);
          }
          if (typeof prefData.columns === 'number') {
            setColumns(prefData.columns as any);
          }
          if (typeof prefData.show_chords === 'boolean') {
            setShowChords(prefData.show_chords);
          }
        }

        setTimeout(() => {
          isInitialPrefLoaded.current = true;
        }, 300);
      } catch (err) {
        console.error('Error al cargar canción:', err);
        alert('No se pudo encontrar la canción solicitada.');
        navigate('/admin/songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadSongAndPreferences();
  }, [id, navigate]);

  // Cargar lista de canciones de la sesión si se accede en contexto de un culto
  useEffect(() => {
    if (!sessionId) {
      setSessionSongs([]);
      setCurrentSession(null);
      return;
    }

    const loadSessionSetlist = async () => {
      try {
        setIsLoadingSession(true);
        const [songsData, sessionData] = await Promise.all([
          meetingsService.getSessionSongs(sessionId),
          meetingsService.getSessionById(sessionId).catch(() => null),
        ]);
        setSessionSongs(songsData);
        if (sessionData) setCurrentSession(sessionData);
      } catch (err) {
        console.error('Error al cargar setlist de la sesión:', err);
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSessionSetlist();
  }, [sessionId]);

  // Posición actual en el setlist del culto
  const currentIndex = useMemo(() => {
    if (!sessionId || sessionSongs.length === 0 || !id) return -1;
    return sessionSongs.findIndex((s) => s.song_id === id || s.song?.id === id);
  }, [sessionId, sessionSongs, id]);

  const prevSongItem = useMemo(() => {
    if (currentIndex > 0) return sessionSongs[currentIndex - 1];
    return null;
  }, [currentIndex, sessionSongs]);

  const nextSongItem = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < sessionSongs.length - 1) {
      return sessionSongs[currentIndex + 1];
    }
    return null;
  }, [currentIndex, sessionSongs]);

  const handleNavigateSong = (targetSongId: string) => {
    navigate(`/admin/songs/${targetSongId}?sessionId=${sessionId}`);
  };

  // Atajos de teclado en vivo para cambiar de canción (Flecha Izq / Flecha Der / PageUp / PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.key === 'ArrowLeft' || e.key === 'PageUp') && prevSongItem) {
        e.preventDefault();
        handleNavigateSong(prevSongItem.song_id);
      } else if ((e.key === 'ArrowRight' || e.key === 'PageDown') && nextSongItem) {
        e.preventDefault();
        handleNavigateSong(nextSongItem.song_id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSongItem, nextSongItem, sessionId]);

  // Gestos táctiles de navegación horizontal
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

    // Solo si el deslizamiento horizontal es mayor a 65px y más pronunciado que el scroll vertical
    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && nextSongItem) {
        handleNavigateSong(nextSongItem.song_id);
      } else if (deltaX > 0 && prevSongItem) {
        handleNavigateSong(prevSongItem.song_id);
      }
    }
  };

  // Gestos táctiles para deslizar y ocultar/mostrar la barra flotante de navegación inferior
  const handleBottomNavTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      bottomNavTouchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleBottomNavTouchEnd = (e: React.TouchEvent) => {
    if (!bottomNavTouchStart.current || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - bottomNavTouchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - bottomNavTouchStart.current.y;
    bottomNavTouchStart.current = null;

    if (deltaX > 20 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsBottomNavCollapsed(true);
    } else if (deltaX < -20 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsBottomNavCollapsed(false);
    }
  };

  const handleBottomNavMouseDown = (e: React.MouseEvent) => {
    bottomNavMouseStart.current = e.clientX;
  };

  const handleBottomNavMouseUp = (e: React.MouseEvent) => {
    if (bottomNavMouseStart.current !== null) {
      const deltaX = e.clientX - bottomNavMouseStart.current;
      bottomNavMouseStart.current = null;
      if (deltaX > 20) {
        setIsBottomNavCollapsed(true);
      } else if (deltaX < -20) {
        setIsBottomNavCollapsed(false);
      }
    }
  };

  // Guardar preferencias en segundo plano (debounce 600ms)
  useEffect(() => {
    if (!song || !isInitialPrefLoaded.current) return;

    const timer = setTimeout(() => {
      songsService.saveUserPreference(song.id, {
        semitones,
        font_size: fontSize,
        columns,
        show_chords: showChords,
      }).catch((err) => {
        console.error('Error guardando preferencia de usuario:', err);
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [song, semitones, fontSize, columns, showChords]);

  // Restablecer al tono original y guardar preferencia
  const handleResetToOriginalKey = () => {
    setSemitones(0);
    if (song && isInitialPrefLoaded.current) {
      songsService.saveUserPreference(song.id, {
        semitones: 0,
        font_size: fontSize,
        columns,
        show_chords: showChords,
      }).catch(() => {});
    }
  };

  // Contenido transpuesto en tiempo real
  const transposedContent = useMemo(() => {
    if (!song) return '';
    return transposeSongContent(song.content, semitones);
  }, [song, semitones]);

  // Tonalidad actual calculada
  const currentKeyDisplay = useMemo(() => {
    if (!song) return '';
    const baseKey = MUSICAL_KEY_SHORT[song.original_key] || song.original_key;
    if (semitones === 0) return baseKey;
    return transposeChord(baseKey, semitones);
  }, [song, semitones]);

  // Extraer ID de YouTube para incrustar
  const youtubeVideoId = useMemo(() => {
    if (!song?.youtube_url) return null;
    const match = song.youtube_url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match ? match[1] : null;
  }, [song?.youtube_url]);

  const handleDeleteSong = async () => {
    if (!song) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la canción "${song.title}"?`)) return;

    try {
      await songsService.deleteSong(song.id);
      navigate('/admin/songs');
    } catch (err) {
      console.error('Error al eliminar canción:', err);
      alert('No se pudo eliminar la canción.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando canción...</p>
      </div>
    );
  }

  if (!song) return null;

  return (
    <div
      ref={fullscreenContainerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`space-y-6 max-w-6xl mx-auto pb-16 transition-colors ${
        isFullscreen
          ? 'bg-background text-foreground fixed inset-0 z-[100] max-w-none p-4 sm:p-8 overflow-y-auto'
          : ''
      }`}
    >
      {/* Header en Pantalla Completa (Modo Atril de Escenario) */}
      {isFullscreen ? (
        <div className="border-b pb-3 mb-6 select-none">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{song.title}</h1>

                {/* Previsualización en letras pequeñas de la siguiente canción (Escritorio) */}
                {sessionId && nextSongItem && (
                  <button
                    onClick={() => handleNavigateSong(nextSongItem.song_id)}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs transition-colors cursor-pointer group shrink-0"
                    title={`Ir a la siguiente canción: ${nextSongItem.song?.title}`}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                      &gt; Siguiente:
                    </span>
                    <span className="font-semibold text-xs truncate max-w-[140px] sm:max-w-[200px]">
                      {nextSongItem.song?.title}
                    </span>
                    <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-normal mt-0.5 truncate">
                {song.artist_rel?.name || song.artist}
              </p>
            </div>

            {/* En Móvil Fullscreen: Únicamente botón de lista */}
            {sessionId && sessionSongs.length > 0 && (
              <div className="lg:hidden flex items-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 gap-1 bg-muted/40 hover:bg-muted border border-border/70 text-foreground rounded-lg"
                  onClick={() => setIsSetlistSheetOpen(true)}
                  title="Ver repertorio de canciones"
                >
                  <ListMusic className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">
                    {sessionSongs.length}
                  </span>
                </Button>
              </div>
            )}

            {/* Controles de Barra Superior en Escritorio */}
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              {/* Botón de Lista del Repertorio Completo */}
              {sessionId && sessionSongs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary shadow-xs"
                  onClick={() => setIsSetlistSheetOpen(true)}
                  title="Permite ver toda la lista e ir directo a otra canción"
                >
                  <ListMusic className="h-4 w-4" />
                  <span className="hidden xl:inline">Repertorio</span>
                  <span className="text-[10px] font-mono bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full font-bold">
                    {sessionSongs.length}
                  </span>
                </Button>
              )}

              {/* Tono */}
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border">
                <span className="text-xs font-semibold text-muted-foreground px-1">Tono:</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSemitones((prev) => prev - 1)}
                  title="Bajar medio tono"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <div className="w-16 h-7 bg-primary text-primary-foreground font-mono font-bold text-xs rounded shadow-xs flex items-center justify-center shrink-0 select-none">
                  <span>{currentKeyDisplay}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSemitones((prev) => prev + 1)}
                  title="Subir medio tono"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleResetToOriginalKey}
                  disabled={semitones === 0}
                  title={semitones === 0 ? 'Tono original' : 'Restablecer tono original'}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Toggle Acordes */}
              <Button
                variant={showChords ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setShowChords(!showChords)}
              >
                {showChords ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {showChords ? 'Acordes' : 'Solo Letra'}
              </Button>

              {/* Zoom */}
              <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
                  disabled={fontSize <= 10}
                  title="Reducir letra"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-mono px-1.5">{fontSize}px</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setFontSize((prev) => Math.min(28, prev + 1))}
                  disabled={fontSize >= 28}
                  title="Aumentar letra"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Columnas */}
              <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                {([1, 2, 3] as const).map((col) => (
                  <Button
                    key={col}
                    variant={columns === col ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs font-mono"
                    onClick={() => setColumns(col)}
                  >
                    {col} Col
                  </Button>
                ))}
              </div>

              {/* Salir de Pantalla Completa */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-primary/40 text-primary"
                onClick={handleToggleFullscreen}
                title="Salir de pantalla completa (Esc)"
              >
                <Minimize className="h-4 w-4" />
                Salir (Esc)
              </Button>
            </div>
          </div>

          {/* En Móvil Fullscreen: Barra limpia de siguiente canción abajo del título */}
          {sessionId && nextSongItem && (
            <div className="lg:hidden mt-2 pt-2 border-t border-border/40">
              <button
                onClick={() => handleNavigateSong(nextSongItem.song_id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs transition-colors cursor-pointer border border-primary/20"
                title={`Ir a la siguiente canción: ${nextSongItem.song?.title}`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] font-bold text-primary/70 uppercase">Siguiente:</span>
                  <span className="font-semibold truncate">{nextSongItem.song?.title}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Header Normal */
        <div className="space-y-3 border-b pb-4">
          {/* Barra de Navegación de Sesión / Setlist si está en contexto de Culto (Visible en tablet/desktop) */}
          {sessionId && (
            <div className="hidden sm:flex items-center justify-between bg-primary/10 dark:bg-primary/15 border border-primary/25 px-3 sm:px-4 py-2.5 rounded-xl gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1.5 text-primary hover:bg-primary/20 font-semibold text-xs shrink-0"
                  onClick={() => setIsSetlistSheetOpen(true)}
                  title="Ver todo el repertorio"
                >
                  <ListMusic className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">
                    {currentSession?.recurring_meetings?.name || 'Repertorio del Culto'}
                  </span>
                </Button>

                <Badge variant="default" className="text-xs px-2 py-0 bg-primary shrink-0">
                  {currentIndex + 1} de {sessionSongs.length}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs bg-background hover:bg-muted"
                  onClick={() => prevSongItem && handleNavigateSong(prevSongItem.song_id)}
                  disabled={!prevSongItem}
                  title={prevSongItem ? `Anterior: ${prevSongItem.song.title}` : 'Primera canción'}
                >
                  <SkipBack className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1 text-xs bg-primary text-primary-foreground font-semibold"
                  onClick={() => nextSongItem && handleNavigateSong(nextSongItem.song_id)}
                  disabled={!nextSongItem}
                  title={nextSongItem ? `Siguiente: ${nextSongItem.song.title}` : 'Última canción'}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <SkipForward className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Encabezado Principal de Canción */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              {/* Lado Izquierdo: Volver + Título */}
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 mt-0.5"
                  onClick={() =>
                    sessionId
                      ? navigate(`/admin/services/session/${sessionId}`)
                      : navigate('/admin/songs')
                  }
                  title={sessionId ? 'Volver a la sesión del culto' : 'Volver a la lista de canciones'}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                      {song.title}
                    </h1>

                    {/* Previsualización en letras pequeñas de la siguiente canción (Escritorio) */}
                    {sessionId && nextSongItem && (
                      <button
                        onClick={() => handleNavigateSong(nextSongItem.song_id)}
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs transition-colors cursor-pointer group shrink-0"
                        title={`Ir a la siguiente canción: ${nextSongItem.song?.title}`}
                      >
                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          &gt; Siguiente:
                        </span>
                        <span className="font-semibold text-xs truncate max-w-[140px] sm:max-w-[220px]">
                          {nextSongItem.song?.title}
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    )}
                  </div>

                  {/* Nombre del Autor y Todos los Badges agrupados juntos */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                    <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">
                      {song.artist_rel?.name || song.artist}
                    </span>

                    {song.bpm && (
                      <Badge
                        variant="outline"
                        className={`font-normal text-[11px] h-5 px-2 ${
                          song.bpm >= 100
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {song.bpm >= 100 ? '⚡ Rápida' : '🕊️ Lenta'} ({song.bpm} BPM)
                      </Badge>
                    )}

                    {song.version_type && (
                      <Badge variant="secondary" className="font-normal text-[11px] h-5 px-2">
                        {song.version_type.name}
                      </Badge>
                    )}

                    {song.song_type && (
                      <Badge
                        variant="outline"
                        className="font-normal text-[11px] h-5 px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                      >
                        {song.song_type.name}
                      </Badge>
                    )}

                    {song.theme && (
                      <Badge
                        variant="outline"
                        className="font-normal text-[11px] h-5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      >
                        {song.theme.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Botones de Acción */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botón de Lista en Móvil cuando no es Fullscreen */}
                {sessionId && sessionSongs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:hidden h-8 px-2 gap-1 bg-muted/40 hover:bg-muted border border-border/70 text-foreground rounded-lg"
                    onClick={() => setIsSetlistSheetOpen(true)}
                    title="Ver repertorio completo"
                  >
                    <ListMusic className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      {sessionSongs.length}
                    </span>
                  </Button>
                )}

                {/* Botón Imprimir / PDF */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 sm:px-3 gap-1.5 text-xs shadow-xs"
                  onClick={() => setIsPrintModalOpen(true)}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Imprimir / PDF</span>
                </Button>

                {/* Menú de Más Opciones (Tres puntos ⋮ con Editar y Eliminar) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      title="Más opciones"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {sessionId && (
                      <DropdownMenuItem
                        onClick={() => setIsShareModalOpen(true)}
                        className="cursor-pointer gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Compartir repertorio</span>
                      </DropdownMenuItem>
                    )}

                    <Can resource="songs" action="update">
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                        className="cursor-pointer gap-2 text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar canción</span>
                      </DropdownMenuItem>
                    </Can>

                    <Can resource="songs" action="delete">
                      <DropdownMenuItem
                        onClick={handleDeleteSong}
                        className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Eliminar canción</span>
                      </DropdownMenuItem>
                    </Can>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* En Móvil Normal: Barra limpia de siguiente canción */}
            {sessionId && nextSongItem && (
              <div className="sm:hidden pt-1.5 border-t border-border/40">
                <button
                  onClick={() => handleNavigateSong(nextSongItem.song_id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs transition-colors cursor-pointer border border-primary/20"
                  title={`Ir a la siguiente canción: ${nextSongItem.song?.title}`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] font-bold text-primary/70 uppercase">Siguiente:</span>
                    <span className="font-semibold truncate">{nextSongItem.song?.title}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Columna Flotante Lateral Móvil / Tablet ("Más delgada", sin header "Ajustes", sin navegación interna) */}
      <div
        ref={mobileControlsRef}
        className="lg:hidden fixed z-50 transition-all select-none touch-none"
        style={{
          top: `${bubbleY}px`,
          ...(bubbleSide === 'right' ? { right: '6px' } : { left: '6px' }),
        }}
      >
        {/* Pestaña / Burbuja para expandir (Arrastrable con touch o mouse) */}
        {!isMobileControlsOpen ? (
          <div
            className={`flex items-center shadow-xl cursor-grab active:cursor-grabbing ${
              bubbleSide === 'right' ? 'flex-row' : 'flex-row-reverse'
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              dragInfoRef.current = { startX, startY, initialY: bubbleY, moved: false };
              setIsDragging(true);
            }}
            onTouchStart={(e) => {
              const startX = e.touches[0].clientX;
              const startY = e.touches[0].clientY;
              dragInfoRef.current = { startX, startY, initialY: bubbleY, moved: false };
              setIsDragging(true);
            }}
            onClick={() => {
              if (!dragInfoRef.current.moved) {
                setIsMobileControlsOpen(true);
              }
            }}
          >
            <div
              className={`h-9 px-2 bg-background/90 dark:bg-background/95 backdrop-blur-md border shadow-lg flex items-center gap-1 text-xs font-semibold ${
                bubbleSide === 'right'
                  ? 'rounded-l-xl border-r-0 pl-1.5 pr-2.5'
                  : 'rounded-r-xl border-l-0 pr-1.5 pl-2.5'
              }`}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              <SlidersHorizontal className="h-3 w-3 text-primary shrink-0" />
              <span className="font-mono text-[10px] font-bold text-primary w-6 text-center shrink-0">
                {currentKeyDisplay}
              </span>
            </div>
          </div>
        ) : (
          /* Columna Flotante Semitransparente Abierta (Ultra delgada) */
          <div className="flex flex-col items-center gap-1.5 p-1.5 bg-background/90 dark:bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl animate-in fade-in duration-150 w-11">
            {/* Botón para Cerrar / Colapsar */}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground mb-0.5"
              onClick={() => setIsMobileControlsOpen(false)}
              title="Ocultar controles"
            >
              <X className="h-3.5 w-3.5" />
            </Button>

            {/* 1. Control de Tono Vertical */}
            <div className="flex flex-col items-center gap-0.5 bg-muted/60 p-0.5 rounded-xl border border-border/60 w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded"
                onClick={() => setSemitones((prev) => prev + 1)}
                title="Subir tono (+1)"
              >
                <Plus className="h-3 w-3" />
              </Button>

              <div className="w-8 h-7 bg-primary text-primary-foreground font-mono font-bold text-[11px] rounded shadow-xs flex flex-col items-center justify-center shrink-0 select-none">
                <span className="leading-none">{currentKeyDisplay}</span>
                {semitones !== 0 && (
                  <span className="text-[8px] leading-none opacity-85 font-normal">
                    {semitones > 0 ? `+${semitones}` : semitones}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded"
                onClick={() => setSemitones((prev) => prev - 1)}
                title="Bajar tono (-1)"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                onClick={handleResetToOriginalKey}
                disabled={semitones === 0}
                title={semitones === 0 ? 'Tonalidad original' : 'Restablecer tono original'}
              >
                <RotateCcw className="h-2.5 w-2.5" />
              </Button>
            </div>

            {/* 2. Toggle Acordes / Solo Letra */}
            <Button
              variant={showChords ? 'default' : 'outline'}
              size="icon"
              className="h-7 w-7 rounded-xl"
              onClick={() => setShowChords(!showChords)}
              title={showChords ? 'Ocultar acordes (Solo Letra)' : 'Mostrar acordes'}
            >
              {showChords ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>

            {/* 3. Zoom de Letra Vertical */}
            <div className="flex flex-col items-center gap-0.5 bg-muted/60 p-0.5 rounded-xl border border-border/60 w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setFontSize((prev) => Math.min(28, prev + 1))}
                disabled={fontSize >= 28}
                title="Aumentar letra"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <span className="text-[9px] font-mono font-semibold py-0.2 text-muted-foreground">
                {fontSize}px
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
                disabled={fontSize <= 10}
                title="Reducir letra"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
            </div>

            {/* 4. Pantalla Completa / Salir */}
            <Button
              variant={isFullscreen ? 'secondary' : 'outline'}
              size="icon"
              className="h-7 w-7 rounded-xl"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Modo pantalla completa (Atril)'}
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Barra Flotante de Navegación Inferior Derecha en Móvil (Deslizable a la derecha para ocultar) */}
      {sessionId && sessionSongs.length > 0 && (
        <div
          onTouchStart={handleBottomNavTouchStart}
          onTouchEnd={handleBottomNavTouchEnd}
          onMouseDown={handleBottomNavMouseDown}
          onMouseUp={handleBottomNavMouseUp}
          className={`lg:hidden fixed bottom-1.5 z-40 transition-all duration-300 ease-out select-none flex items-center ${
            isBottomNavCollapsed
              ? 'right-0 translate-x-[calc(100%-14px)]'
              : 'right-1 translate-x-0'
          }`}
        >
          {/* Pestaña / Handle para expandir o colapsar */}
          <button
            onClick={() => setIsBottomNavCollapsed(!isBottomNavCollapsed)}
            className={`h-9 w-3.5 bg-background/95 backdrop-blur border border-r-0 border-border/80 shadow-lg rounded-l-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ${
              !isBottomNavCollapsed ? 'opacity-40 hover:opacity-100' : 'opacity-90'
            }`}
            title={isBottomNavCollapsed ? 'Mostrar navegación' : 'Ocultar navegación'}
          >
            {isBottomNavCollapsed ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {/* Widget de botones */}
          <div className="bg-background/90 dark:bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-r-xl p-0.5 flex flex-col items-center">
            <div className="flex items-center gap-0.2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-25"
                onClick={() => prevSongItem && handleNavigateSong(prevSongItem.song_id)}
                disabled={!prevSongItem}
                title={prevSongItem ? `Anterior: ${prevSongItem.song.title}` : 'Primera canción'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-25"
                onClick={() => nextSongItem && handleNavigateSong(nextSongItem.song_id)}
                disabled={!nextSongItem}
                title={nextSongItem ? `Siguiente: ${nextSongItem.song.title}` : 'Última canción'}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <span className="text-[9px] font-bold font-mono text-muted-foreground leading-none pb-0.5">
              {currentIndex >= 0 ? `${currentIndex + 1}/${sessionSongs.length}` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Reproductor de YouTube y Multitrack (Solo en modo normal) */}
      {!isFullscreen && (youtubeVideoId || song.multitrack_url) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 p-3 bg-card border rounded-xl shadow-xs overflow-hidden max-w-full">
          {youtubeVideoId ? (
            <div className="relative h-[125px] w-full sm:w-[222px] shrink-0 rounded-lg overflow-hidden border bg-black shadow-inner">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`${song.title} - YouTube`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="h-20 sm:h-[125px] w-full sm:w-[125px] shrink-0 rounded-lg border bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileAudio className="h-8 w-8" />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Youtube className="h-4 w-4 shrink-0" />
              <span>Video / Audio de Referencia</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Reproduce la versión guía o el arreglo original directamente mientras visualizas la canción.
            </p>

            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              {youtubeVideoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline w-fit"
                >
                  <span>Abrir en YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {song.multitrack_url && (
                <a
                  href={song.multitrack_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors w-fit"
                >
                  <FileAudio className="h-3.5 w-3.5" />
                  <span>Multitrack (Descargar / Abrir)</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notas del arreglo si existen (Solo en modo normal) */}
      {!isFullscreen && song.notes && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 overflow-hidden max-w-full">
          <span className="font-bold uppercase tracking-wider block mb-0.5">Notas del Arreglo:</span>
          {song.notes}
        </div>
      )}

      {/* Barra de Control y Transposición en Tiempo Real (Fijada en el borde superior al scrollear en escritorio) */}
      {!isFullscreen && (
        <div className="hidden lg:flex sticky top-[-1.2em] z-30 bg-background/95 backdrop-blur border rounded-xl p-3 shadow-md items-center justify-between gap-3 max-w-full">
          {/* Controles de Transposición de Tono y Lista de Canciones */}
          <div className="flex items-center gap-2">
            {/* Botón de Lista de Canciones si está en sesión */}
            {sessionId && sessionSongs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary shadow-xs"
                onClick={() => setIsSetlistSheetOpen(true)}
                title="Permite ver toda la lista e ir directo a otra canción"
              >
                <ListMusic className="h-4 w-4" />
                <span>Repertorio</span>
                <span className="text-[10px] font-mono bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full font-bold">
                  {sessionSongs.length}
                </span>
              </Button>
            )}

            <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-lg border">
              <span className="text-xs font-semibold text-muted-foreground px-1">Tono:</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded"
                onClick={() => setSemitones((prev) => prev - 1)}
                title="Bajar medio tono (-1 semitono)"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <div className="w-[84px] h-7 bg-primary text-primary-foreground font-mono font-bold text-sm rounded shadow-xs flex items-center justify-center gap-1 shrink-0 select-none">
                <span>{currentKeyDisplay}</span>
                {semitones !== 0 && (
                  <span className="text-[10px] opacity-85 font-normal">
                    ({semitones > 0 ? `+${semitones}` : semitones})
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded"
                onClick={() => setSemitones((prev) => prev + 1)}
                title="Subir medio tono (+1 semitono)"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={handleResetToOriginalKey}
                disabled={semitones === 0}
                title={semitones === 0 ? 'Tonalidad original' : 'Restablecer tonalidad original'}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Parámetros musicales (BPM / Compás) */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {song.bpm && (
              <Badge variant="outline" className="font-mono">
                Tempo: {song.bpm} BPM
              </Badge>
            )}
            {song.time_signature && (
              <Badge variant="outline" className="font-mono">
                Compás: {song.time_signature}
              </Badge>
            )}
          </div>

          {/* Controles de Visualización: Acordes, Zoom, Columnas, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Toggle Acordes */}
            <Button
              variant={showChords ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowChords(!showChords)}
            >
              {showChords ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {showChords ? 'Acordes Visibles' : 'Solo Letra'}
            </Button>

            {/* Zoom Letra */}
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
                disabled={fontSize <= 10}
                title="Reducir tamaño de letra"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono px-1.5 select-none">{fontSize}px</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFontSize((prev) => Math.min(28, prev + 1))}
                disabled={fontSize >= 28}
                title="Aumentar tamaño de letra"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Selector de Columnas */}
            <div className="hidden sm:flex items-center border rounded-lg p-0.5 bg-muted/40">
              {([1, 2, 3] as const).map((col) => (
                <Button
                  key={col}
                  variant={columns === col ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs font-mono"
                  onClick={() => setColumns(col)}
                  title={`${col} Columna${col > 1 ? 's' : ''}`}
                >
                  {col} Col
                </Button>
              ))}
            </div>

            {/* Botón Pantalla Completa Rápido */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleFullscreen}
              title="Modo pantalla completa (Atril)"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Visor Principal de Acordes y Letras con Scroll Interno */}
      <Card className={isFullscreen ? 'border-0 shadow-none bg-transparent overflow-hidden' : 'shadow-sm overflow-hidden max-w-full'}>
        <CardContent className={isFullscreen ? 'p-0 overflow-x-auto max-w-full' : 'p-4 sm:p-6 md:p-8 overflow-x-auto max-w-full'}>
          <ChordSheetViewer
            content={transposedContent}
            showChords={showChords}
            fontSize={fontSize}
            columns={columns}
          />
        </CardContent>
      </Card>

      {/* Modal de Impresión */}
      <PrintSongModal
        open={isPrintModalOpen}
        onOpenChange={setIsPrintModalOpen}
        song={song}
        currentContent={transposedContent}
        currentKey={currentKeyDisplay}
      />

      {/* Panel Lateral de Lista de Canciones del Culto (Repertorio Completo) */}
      <SetlistSheet
        open={isSetlistSheetOpen}
        onOpenChange={setIsSetlistSheetOpen}
        sessionSongs={sessionSongs}
        currentSongId={song.id}
        sessionTitle={currentSession?.recurring_meetings?.name || 'Repertorio del Culto'}
        sessionDate={currentSession?.session_date}
        sessionId={sessionId || undefined}
        onSelectSong={handleNavigateSong}
        container={fullscreenContainerRef.current}
      />

      {/* Modal para Compartir Repertorio */}
      {sessionId && (
        <ShareSetlistModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          session={currentSession}
          sessionSongs={sessionSongs}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}
