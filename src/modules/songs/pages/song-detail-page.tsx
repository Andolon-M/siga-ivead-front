import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Can } from '@/shared/components/auth/can';
import type { Song, MusicalKey } from '../types';
import { songsService } from '../services/songs.service';
import {
  MUSICAL_KEY_SHORT,
  transposeSongContent,
  transposeChord,
} from '../utils/chord-transposer';
import { ChordSheetViewer } from '../components/chord-sheet-viewer';
import { PrintSongModal } from '../components/print-song-modal';

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const mobileControlsRef = useRef<HTMLDivElement>(null);

  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialPrefLoaded = useRef<boolean>(false);

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

  // Estados de posicionamiento y arrastre de la burbuja flotante móvil
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('right');
  const [bubbleY, setBubbleY] = useState<number>(110);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragInfoRef = useRef<{ startX: number; startY: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialY: 110,
    moved: false,
  });

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

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragInfoRef.current = {
      startX: clientX,
      startY: clientY,
      initialY: bubbleY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    // Si fue un arrastre, no abrir los controles
    if (dragInfoRef.current.moved) {
      e.stopPropagation();
      return;
    }
    setIsMobileControlsOpen(true);
  };

  // Alternar pantalla completa
  const handleToggleFullscreen = async () => {
    try {
      const willBeFullscreen = !isFullscreen;
      setIsFullscreen(willBeFullscreen);

      if (willBeFullscreen) {
        if (fullscreenContainerRef.current?.requestFullscreen) {
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
      className={`space-y-6 max-w-6xl mx-auto pb-16 transition-colors ${
        isFullscreen
          ? 'bg-background text-foreground fixed inset-0 z-[100] max-w-none p-4 sm:p-8 overflow-y-auto'
          : ''
      }`}
    >
      {/* Header en Pantalla Completa (Modo Atril de Escenario) */}
      {isFullscreen ? (
        <div className="border-b pb-3 mb-6 flex flex-wrap items-center justify-between gap-3 select-none">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{song.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{song.artist}</p>
          </div>

          <div className="hidden lg:flex flex-wrap items-center gap-2">
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
      ) : (
        /* Header Normal */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/songs')}
              title="Volver a la lista de canciones"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{song.title}</h1>
                {song.song_type && (
                  <Badge
                    variant="outline"
                    className="font-normal text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                  >
                    {song.song_type.name}
                  </Badge>
                )}
                {song.theme && (
                  <Badge
                    variant="outline"
                    className="font-normal text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  >
                    {song.theme.name}
                  </Badge>
                )}
                {song.version_type && (
                  <Badge variant="secondary" className="font-normal text-xs">
                    {song.version_type.name}
                  </Badge>
                )}
                {song.bpm && (
                  <Badge
                    variant="outline"
                    className={`font-normal text-xs ${
                      song.bpm >= 100
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {song.bpm >= 100 ? '⚡ Rápida' : '🕊️ Lenta'} ({song.bpm} BPM)
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                {song.artist_rel?.name || song.artist}
              </p>
            </div>
          </div>

          {/* Acciones Superiores */}
          <div className="flex flex-wrap items-center gap-2">
            {song.multitrack_url && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                onClick={() => window.open(song.multitrack_url!, '_blank')}
              >
                <FileAudio className="h-4 w-4" />
                Multitrack
                <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsPrintModalOpen(true)}
            >
              <Printer className="h-4 w-4" />
              Imprimir / PDF
            </Button>

            <Can resource="songs" action="update">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                className="gap-1.5"
              >
                <Edit2 className="h-4 w-4" />
                Editar
              </Button>
            </Can>

            <Can resource="songs" action="delete">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSong}
                className="text-destructive hover:bg-destructive/10"
                title="Eliminar canción"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Can>
          </div>
        </div>
      )}

      {/* Columna Flotante Lateral Móvil / Tablet (Draggable, reposicionable y con click-outside) */}
      <div
        ref={mobileControlsRef}
        className="lg:hidden fixed z-50 transition-all select-none touch-none"
        style={{
          top: `${bubbleY}px`,
          ...(bubbleSide === 'right' ? { right: '8px' } : { left: '8px' }),
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
              className={`h-11 px-3 py-1 bg-background/90 dark:bg-background/95 backdrop-blur-md border shadow-lg flex items-center gap-1.5 text-xs font-semibold ${
                bubbleSide === 'right'
                  ? 'rounded-l-2xl border-r-0 pl-2 pr-3'
                  : 'rounded-r-2xl border-l-0 pr-2 pl-3'
              }`}
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-mono text-[11px] font-bold text-primary w-7 text-center shrink-0">
                {currentKeyDisplay}
              </span>
              {bubbleSide === 'right' ? (
                <ChevronLeft className="h-3 w-3 opacity-60 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 opacity-60 shrink-0" />
              )}
            </div>
          </div>
        ) : (
          /* Columna Flotante Semitransparente Abierta */
          <div className="flex flex-col items-center gap-2 p-2.5 bg-background/90 dark:bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl animate-in fade-in duration-200">
            {/* Botón para Ocultar / Colapsar */}
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Ajustes</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileControlsOpen(false)}
                title="Ocultar controles"
              >
                {bubbleSide === 'right' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {/* 1. Control de Tono Vertical con Ancho Fijo */}
            <div className="flex flex-col items-center gap-0.5 bg-muted/60 p-1 rounded-xl border border-border/60">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setSemitones((prev) => prev + 1)}
                title="Subir tono (+1)"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              <div className="w-10 h-9 bg-primary text-primary-foreground font-mono font-bold text-xs rounded-lg shadow-xs flex flex-col items-center justify-center shrink-0 select-none">
                <span className="leading-tight">{currentKeyDisplay}</span>
                <span className={`text-[9px] leading-none ${semitones !== 0 ? 'opacity-85 font-normal' : 'opacity-0 select-none'}`}>
                  {semitones > 0 ? `+${semitones}` : semitones || '+0'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setSemitones((prev) => prev - 1)}
                title="Bajar tono (-1)"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                onClick={handleResetToOriginalKey}
                disabled={semitones === 0}
                title={semitones === 0 ? 'Tonalidad original' : 'Restablecer tono original'}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            {/* 2. Toggle Acordes / Solo Letra */}
            <Button
              variant={showChords ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setShowChords(!showChords)}
              title={showChords ? 'Ocultar acordes (Solo Letra)' : 'Mostrar acordes'}
            >
              {showChords ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>

            {/* 3. Zoom de Letra Vertical */}
            <div className="flex flex-col items-center gap-0.5 bg-muted/60 p-1 rounded-xl border border-border/60">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setFontSize((prev) => Math.min(28, prev + 1))}
                disabled={fontSize >= 28}
                title="Aumentar letra"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <span className="text-[10px] font-mono font-semibold py-0.5 text-muted-foreground">{fontSize}px</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
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
              className="h-8 w-8 rounded-xl"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Modo pantalla completa (Atril)'}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Reproductor de YouTube Compacto Fijo (Solo en modo normal) */}
      {!isFullscreen && youtubeVideoId && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 p-2.5 bg-card border rounded-xl shadow-sm overflow-hidden max-w-full">
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
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Youtube className="h-4 w-4 shrink-0" />
              <span>Video / Audio de Referencia</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Reproduce la versión guía o el arreglo original directamente mientras visualizas la canción.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-0.5 w-fit"
            >
              <span>Abrir en YouTube</span>
              <ExternalLink className="h-3 w-3" />
            </a>
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

      {/* Barra de Control y Transposición en Tiempo Real (Fijada en el borde superior al scrollear) */}
      {!isFullscreen && (
        <div className="hidden lg:flex sticky top-[-1.2em] z-30 bg-background/95 backdrop-blur border rounded-xl p-3 shadow-md items-center justify-between gap-3 max-w-full">
          {/* Controles de Transposición de Tono con Ancho Fijo */}
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
    </div>
  );
}
