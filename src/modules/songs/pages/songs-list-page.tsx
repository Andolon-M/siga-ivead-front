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
import type { Song, MusicalKey, SongVersionType } from '../types';
import { songsService } from '../services/songs.service';
import { MUSICAL_KEY_LABELS, MUSICAL_KEY_SHORT } from '../utils/chord-transposer';

const MUSICAL_KEYS = Object.keys(MUSICAL_KEY_LABELS) as MusicalKey[];

export function SongsListPage() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState<Song[]>([]);
  const [versionTypes, setVersionTypes] = useState<SongVersionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [selectedVersionType, setSelectedVersionType] = useState<string>('ALL');

  // Cargar canciones y tipos
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [songsRes, typesRes] = await Promise.all([
        songsService.getAllSongs({
          search: searchTerm || undefined,
          key: selectedKey !== 'ALL' ? (selectedKey as MusicalKey) : undefined,
          version_type_id: selectedVersionType !== 'ALL' ? selectedVersionType : undefined,
        }),
        songsService.getAllVersionTypes(),
      ]);

      setSongs(songsRes.songs);
      setVersionTypes(typesRes);
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
  }, [searchTerm, selectedKey, selectedVersionType]);

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

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, artista o fragmento de letra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filtro por Tonalidad */}
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-[140px] text-xs h-9">
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
            <SelectTrigger className="w-[150px] text-xs h-9">
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
              {searchTerm || selectedKey !== 'ALL' || selectedVersionType !== 'ALL'
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <Card
              key={song.id}
              className="group flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
              onClick={() => navigate(`/admin/songs/${song.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                      {song.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-foreground/80 truncate">
                      {song.artist}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="font-mono text-sm px-2.5 py-0.5 shrink-0 bg-primary/90">
                    {MUSICAL_KEY_SHORT[song.original_key]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {song.version_type?.name && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {song.version_type.name}
                    </Badge>
                  )}
                  {song.bpm && (
                    <span className="px-2 py-0.5 bg-muted rounded font-mono">
                      {song.bpm} BPM
                    </span>
                  )}
                  {song.time_signature && (
                    <span className="px-2 py-0.5 bg-muted rounded font-mono">
                      {song.time_signature}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs">
                  <div className="flex items-center gap-2">
                    {song.youtube_url && (
                      <span className="text-rose-600 flex items-center gap-1 font-medium" title="Tiene enlace de YouTube">
                        <Youtube className="h-4 w-4" />
                      </span>
                    )}
                    {song.multitrack_url && (
                      <span className="text-indigo-600 flex items-center gap-1 font-medium" title="Tiene enlace de Multitrack / Secuencia">
                        <FileAudio className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Can resource="songs" action="read">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/songs/${song.id}`)}
                        title="Ver canción"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Can>
                    <Can resource="songs" action="update">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                        title="Editar canción"
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
                        title="Eliminar canción"
                      >
                        <Trash2 className="h-4 w-4" />
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
                <TableHead className="text-center">Tono</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead className="text-center">BPM</TableHead>
                <TableHead className="text-center">Recursos</TableHead>
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
                  <TableCell className="text-muted-foreground">{song.artist}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono font-bold">
                      {MUSICAL_KEY_SHORT[song.original_key]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {song.version_type?.name || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {song.bpm ? `${song.bpm}` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {song.youtube_url && <Youtube className="h-4 w-4 text-rose-600" title="YouTube" />}
                      {song.multitrack_url && <FileAudio className="h-4 w-4 text-indigo-600" title="Multitrack" />}
                      {!song.youtube_url && !song.multitrack_url && <span className="text-xs text-muted-foreground">-</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/songs/${song.id}`)}
                        title="Ver canción"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Can resource="songs" action="update">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                          title="Editar canción"
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
                          title="Eliminar canción"
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
