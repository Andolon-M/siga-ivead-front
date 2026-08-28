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
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
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

  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados interactivos
  const [semitones, setSemitones] = useState<number>(0);
  const [showChords, setShowChords] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(18);
  const [columns, setColumns] = useState<1 | 2 | 3>(2);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isYoutubeOpen, setIsYoutubeOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sincronizar estado de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
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

  // Cargar canción
  useEffect(() => {
    if (!id) return;

    const loadSong = async () => {
      setIsLoading(true);
      try {
        const data = await songsService.getSongById(id);
        setSong(data);
      } catch (err) {
        console.error('Error al cargar canción:', err);
        alert('No se pudo encontrar la canción solicitada.');
        navigate('/admin/songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadSong();
  }, [id, navigate]);

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
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b pb-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{song.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{song.artist}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono font-bold text-xs rounded">
                {currentKeyDisplay}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSemitones((prev) => prev + 1)}
                title="Subir medio tono"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              {semitones !== 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setSemitones(0)}
                  title="Restablecer tono original"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
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
                onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                disabled={fontSize <= 12}
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
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/songs')}
              title="Volver al cancionero"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{song.title}</h1>
                {song.version_type?.name && (
                  <Badge variant="secondary" className="text-xs">
                    {song.version_type.name}
                  </Badge>
                )}
              </div>
              <p className="text-base text-muted-foreground font-medium">{song.artist}</p>
            </div>
          </div>

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
              onClick={handleToggleFullscreen}
              title="Modo pantalla completa para atril"
            >
              <Maximize className="h-4 w-4" />
              Pantalla Completa
            </Button>

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

      {/* Barra de Control y Transposición en Tiempo Real (Solo en modo normal) */}
      {!isFullscreen && (
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
          {/* Controles de Transposición de Tono */}
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

            <div className="px-2.5 py-0.5 bg-primary text-primary-foreground font-mono font-bold text-sm rounded shadow-sm flex items-center gap-1.5">
              <span>{currentKeyDisplay}</span>
              {semitones !== 0 && (
                <span className="text-[10px] opacity-80">
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

            {semitones !== 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
                onClick={() => setSemitones(0)}
                title="Restablecer tonalidad original"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
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
                onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                disabled={fontSize <= 12}
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

      {/* Reproductor de YouTube Desplegable (Solo en modo normal) */}
      {!isFullscreen && youtubeVideoId && (
        <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
          <CardHeader
            className="py-3 px-4 flex-row items-center justify-between cursor-pointer select-none"
            onClick={() => setIsYoutubeOpen(!isYoutubeOpen)}
          >
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <Youtube className="h-4 w-4" />
              Referencia de YouTube
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isYoutubeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardHeader>

          {isYoutubeOpen && (
            <CardContent className="pt-0 pb-4 px-4">
              <div className="aspect-video w-full max-w-2xl rounded-lg overflow-hidden border shadow-sm mx-auto">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={`${song.title} - YouTube`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Notas del arreglo si existen (Solo en modo normal) */}
      {!isFullscreen && song.notes && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold uppercase tracking-wider block mb-0.5">Notas del Arreglo:</span>
          {song.notes}
        </div>
      )}

      {/* Visor Principal de Acordes y Letras */}
      <Card className={isFullscreen ? 'border-0 shadow-none bg-transparent' : 'shadow-sm'}>
        <CardContent className={isFullscreen ? 'p-0' : 'p-6 sm:p-8'}>
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
