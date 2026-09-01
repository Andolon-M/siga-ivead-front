import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Plus,
  Search,
  Filter,
  Youtube,
  FileAudio,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Loader2,
  LayoutGrid,
  List,
  Sparkles,
  SlidersHorizontal,
  Zap,
  Tag,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Can } from '@/shared/components/auth/can';
import type { Song, MusicalKey, SongVersionType, SongArtist, SongTag, TempoType } from '../types';
import { songsService } from '../services/songs.service';
import { MUSICAL_KEY_LABELS, MUSICAL_KEY_SHORT } from '../utils/chord-transposer';

const MUSICAL_KEYS = Object.keys(MUSICAL_KEY_LABELS) as MusicalKey[];

export function SongsListPage() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState<Song[]>([]);
  const [versionTypes, setVersionTypes] = useState<SongVersionType[]>([]);
  const [tags, setTags] = useState<SongTag[]>([]);
  const [artists, setArtists] = useState<SongArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [selectedVersionType, setSelectedVersionType] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedArtist, setSelectedArtist] = useState<string>('ALL');
  const [selectedTempo, setSelectedTempo] = useState<string>('ALL');

  // Cargar canciones y catálogos
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [songsRes, typesRes, tagsRes, artistsRes] = await Promise.all([
        songsService.getAllSongs({
          search: searchTerm || undefined,
          key: selectedKey !== 'ALL' ? (selectedKey as MusicalKey) : undefined,
          version_type_id: selectedVersionType !== 'ALL' ? selectedVersionType : undefined,
          tag_ids: selectedTag !== 'ALL' ? selectedTag : undefined,
          artist_id: selectedArtist !== 'ALL' ? selectedArtist : undefined,
          tempo_type: selectedTempo !== 'ALL' ? (selectedTempo as TempoType) : undefined,
        }),
        songsService.getAllVersionTypes(),
        songsService.getAllTags(),
        songsService.getAllArtists(),
      ]);

      setSongs(songsRes.songs);
      setVersionTypes(typesRes);
      setTags(tagsRes);
      setArtists(artistsRes);
    } catch (err) {
      console.error('Error al cargar canciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedKey, selectedVersionType, selectedTag, selectedArtist, selectedTempo]);

  const handleDeleteSong = async (song: Song) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la canción "${song.title}"?`)) {
      return;
    }

    try {
      await songsService.deleteSong(song.id);
      await loadData();
    } catch (err) {
      console.error('Error al eliminar canción:', err);
      alert('No se pudo eliminar la canción.');
    }
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedKey !== 'ALL' ||
    selectedVersionType !== 'ALL' ||
    selectedTag !== 'ALL' ||
    selectedArtist !== 'ALL' ||
    selectedTempo !== 'ALL';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedKey('ALL');
    setSelectedVersionType('ALL');
    setSelectedTag('ALL');
    setSelectedArtist('ALL');
    setSelectedTempo('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cancionero Musical</h1>
          <p className="text-muted-foreground">
            Repertorio de canciones, tonalidades, letras con acordes y recursos para el grupo de alabanza
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Can resource="songs" action="create">
            <Button onClick={() => navigate('/admin/songs/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Canción
            </Button>
          </Can>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros Avanzados */}
      <div className="flex flex-col gap-3.5 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista o fragmento de letra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                Limpiar Filtros
              </Button>
            )}
            {/* Toggle de vista cuadrícula / tabla */}
            <div className="flex items-center border rounded-lg p-0.5 bg-muted">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
                title="Vista en Cuadrícula"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('table')}
                title="Vista en Tabla"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Fila de Filtros Desplegables (5 Filtros adaptativos) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Filtro por Etiqueta (Alabanza, Adoración, Sanidad, Gratitud...) */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full text-xs h-9">
              <SelectValue placeholder="Etiqueta: Todas" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              <SelectItem value="ALL">Todas las Etiquetas</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Artista */}
          <Select value={selectedArtist} onValueChange={setSelectedArtist}>
            <SelectTrigger className="w-full text-xs h-9">
              <SelectValue placeholder="Artista: Todos" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              <SelectItem value="ALL">Todos los Artistas</SelectItem>
              {artists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Velocidad / Tempo (Rápida vs Lenta) */}
          <Select value={selectedTempo} onValueChange={setSelectedTempo}>
            <SelectTrigger className="w-full text-xs h-9">
              <SelectValue placeholder="Tempo: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Cualquier Tempo</SelectItem>
              <SelectItem value="fast">⚡ Rápidas (≥ 100 BPM)</SelectItem>
              <SelectItem value="slow">🕊️ Lentas (&lt; 100 BPM)</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por Tonalidad */}
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-full text-xs h-9">
              <SelectValue placeholder="Tono: Todos" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              <SelectItem value="ALL">Todos los Tonos</SelectItem>
              {MUSICAL_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {MUSICAL_KEY_SHORT[key]} ({key.replace('_SHARP', '#')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Tipo de Versión */}
          <Select value={selectedVersionType} onValueChange={setSelectedVersionType}>
            <SelectTrigger className="w-full text-xs h-9">
              <SelectValue placeholder="Versión: Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las Versiones</SelectItem>
              {versionTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando cancionero...</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-card p-6 text-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Music className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No se encontraron canciones</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {hasActiveFilters
                ? 'Prueba modificando los filtros de búsqueda.'
                : 'Comienza agregando la primera canción al repertorio de la iglesia.'}
            </p>
          </div>
          <Can resource="songs" action="create">
            <Button onClick={() => navigate('/admin/songs/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Canción
            </Button>
          </Can>
        </div>
      ) : viewMode === 'grid' ? (
        /* Vista en Cuadrícula */
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <Card
              key={song.id}
              className="group flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all cursor-pointer overflow-hidden w-full max-w-full py-0 gap-0"
              onClick={() => navigate(`/admin/songs/${song.id}`)}
            >
              <CardHeader className="p-4 pb-2.5 w-full min-w-0 block">
                <div className="flex items-start justify-between gap-2.5 w-full min-w-0">
                  <div className="space-y-1 flex-1 min-w-0 overflow-hidden">
                    <CardTitle className="text-base sm:text-lg font-bold truncate group-hover:text-primary transition-colors block" title={song.title}>
                      {song.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm font-medium text-foreground/80 truncate block" title={song.artist_rel?.name || song.artist}>
                      {song.artist_rel?.name || song.artist}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="font-mono text-xs sm:text-sm px-2.5 py-0.5 shrink-0 bg-primary text-primary-foreground font-bold shadow-xs">
                    {MUSICAL_KEY_SHORT[song.original_key]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-3.5 w-full min-w-0 overflow-hidden flex-1 flex flex-col justify-between">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground w-full min-w-0">
                  {song.tags && song.tags.length > 0 && song.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-[11px] font-normal bg-primary/10 text-primary border-primary/20"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {song.version_type?.name && (
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {song.version_type.name}
                    </Badge>
                  )}
                  {song.bpm && (
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-normal font-mono ${
                        song.bpm >= 100
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {song.bpm >= 100 ? '⚡ Rápida' : '🕊️ Lenta'} ({song.bpm})
                    </Badge>
                  )}
                  {song.time_signature && (
                    <span className="px-1.5 py-0.2 bg-muted/60 border rounded text-[11px] font-mono">
                      {song.time_signature}
                    </span>
                  )}
                </div>

                {/* Footer de la tarjeta */}
                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {song.youtube_url && (
                      <span className="text-red-500 flex items-center gap-0.5" title="Video de YouTube">
                        <Youtube className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {song.multitrack_url && (
                      <span className="text-blue-500 flex items-center gap-0.5" title="Secuencia / Multitrack">
                        <FileAudio className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigate(`/admin/songs/${song.id}`)}
                      title="Ver letra y acordes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Can resource="songs" action="update">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                        title="Editar canción"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </Can>
                    <Can resource="songs" action="delete">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(song);
                        }}
                        title="Eliminar canción"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Can>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Vista en Tabla */
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>Tono Original</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead>Tempo / BPM</TableHead>
                <TableHead>Recursos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow
                  key={song.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/songs/${song.id}`)}
                >
                  <TableCell className="font-semibold text-foreground">
                    {song.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.artist_rel?.name || song.artist}
                  </TableCell>
                  <TableCell>
                    {song.tags && song.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {song.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs font-normal bg-primary/10 text-primary border-primary/20"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono font-bold text-xs bg-primary/10 text-primary border-primary/20">
                      {MUSICAL_KEY_SHORT[song.original_key]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {song.version_type?.name ? (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {song.version_type.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {song.bpm ? (
                      <Badge
                        variant="outline"
                        className={`text-xs font-normal font-mono ${
                          song.bpm >= 100
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {song.bpm >= 100 ? '⚡ Rápida' : '🕊️ Lenta'} ({song.bpm})
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {song.youtube_url && (
                        <span title="Video de referencia" className="text-rose-500">
                          <Youtube className="h-4 w-4" />
                        </span>
                      )}
                      {song.multitrack_url && (
                        <span title="Secuencia / Multitrack" className="text-indigo-500">
                          <FileAudio className="h-4 w-4" />
                        </span>
                      )}
                      {!song.youtube_url && !song.multitrack_url && (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/songs/${song.id}`)}
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Can resource="songs" action="update">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Can>
                      <Can resource="songs" action="delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteSong(song)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
