import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Music,
  Sparkles,
  Users,
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Can } from '@/shared/components/auth/can';
import type { SongTypeItem, SongTheme, SongArtist, SongVersionType } from '../types';
import { songsService } from '../services/songs.service';

type CatalogType = 'song_types' | 'themes' | 'artists' | 'version_types';

interface CatalogItem {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export function SongSettingsPage() {
  const [activeTab, setActiveTab] = useState<CatalogType>('song_types');

  // Estados de datos para cada catálogo
  const [songTypes, setSongTypes] = useState<SongTypeItem[]>([]);
  const [themes, setThemes] = useState<SongTheme[]>([]);
  const [artists, setArtists] = useState<SongArtist[]>([]);
  const [versionTypes, setVersionTypes] = useState<SongVersionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtro de búsqueda por catálogo
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: CatalogType; item: CatalogItem | null }>({
    type: 'song_types',
    item: null,
  });
  const [inputName, setInputName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar todos los catálogos
  const loadAllCatalogs = async () => {
    setIsLoading(true);
    try {
      const [typesRes, themesRes, artistsRes, versionsRes] = await Promise.all([
        songsService.getAllSongTypes(),
        songsService.getAllThemes(),
        songsService.getAllArtists(),
        songsService.getAllVersionTypes(),
      ]);

      setSongTypes(typesRes);
      setThemes(themesRes);
      setArtists(artistsRes);
      setVersionTypes(versionsRes);
    } catch (err) {
      console.error('Error al cargar catálogos de canciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCatalogs();
  }, []);

  // Filtrado de elementos en frontend
  const currentItems = useMemo(() => {
    let list: CatalogItem[] = [];
    if (activeTab === 'song_types') list = songTypes;
    else if (activeTab === 'themes') list = themes;
    else if (activeTab === 'artists') list = artists;
    else if (activeTab === 'version_types') list = versionTypes;

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter((item) => item.name.toLowerCase().includes(term));
  }, [activeTab, songTypes, themes, artists, versionTypes, searchTerm]);

  // Configuración de textos por pestaña
  const tabConfig = {
    song_types: {
      title: 'Tipos de Canción',
      subtitle: 'Clasifica por momentos del servicio o propósito musical (ej: Alabanza, Adoración, Intimidad Personal, Júbilo)',
      icon: Music,
      singular: 'Tipo de Canción',
      placeholder: 'Ej: Intimidad Personal, Alabanza Congregacional',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    },
    themes: {
      title: 'Temas Centrales',
      subtitle: 'Enfoque doctrinal o temático de la letra (ej: Cruz y Redención, Espíritu Santo, Gratitud, Sanidad, Fe)',
      icon: Sparkles,
      singular: 'Tema Central',
      placeholder: 'Ej: Cruz y Redención, Fe y Victoria',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    artists: {
      title: 'Artistas y Bandas',
      subtitle: 'Músicos, solistas, grupos o ministerios de adoración',
      icon: Users,
      singular: 'Artista / Banda',
      placeholder: 'Ej: Miel San Marcos, Marcos Witt, Hillsong',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    version_types: {
      title: 'Tipos de Versión',
      subtitle: 'Arreglos y formatos de ejecución (ej: Acústica, En Vivo, Versión Original, Instrumental)',
      icon: Tag,
      singular: 'Tipo de Versión',
      placeholder: 'Ej: Versión Acústica, En Vivo 2026',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
  };

  const currentConfig = tabConfig[activeTab];

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingItem({ type: activeTab, item: null });
    setInputName('');
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem({ type: activeTab, item });
    setInputName(item.name);
    setIsModalOpen(true);
  };

  // Guardar (Crear / Editar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    setIsSaving(true);
    try {
      const name = inputName.trim();
      const { type, item } = editingItem;

      if (type === 'song_types') {
        if (item) await songsService.updateSongType(item.id, name);
        else await songsService.createSongType(name);
      } else if (type === 'themes') {
        if (item) await songsService.updateTheme(item.id, name);
        else await songsService.createTheme(name);
      } else if (type === 'artists') {
        if (item) await songsService.updateArtist(item.id, name);
        else await songsService.createArtist(name);
      } else if (type === 'version_types') {
        if (item) await songsService.updateVersionType(item.id, name);
        else await songsService.createVersionType(name);
      }

      setIsModalOpen(false);
      await loadAllCatalogs();
    } catch (err) {
      console.error('Error al guardar registro:', err);
      alert('Ocurrió un error al guardar el registro en el catálogo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar elemento
  const handleDelete = async (item: CatalogItem) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}" de este catálogo?\n\nLas canciones que lo usen NO serán eliminadas, solo quedarán sin esta categoría asignada.`)) {
      return;
    }

    try {
      if (activeTab === 'song_types') await songsService.deleteSongType(item.id);
      else if (activeTab === 'themes') await songsService.deleteTheme(item.id);
      else if (activeTab === 'artists') await songsService.deleteArtist(item.id);
      else if (activeTab === 'version_types') await songsService.deleteVersionType(item.id);

      await loadAllCatalogs();
    } catch (err) {
      console.error('Error al eliminar registro:', err);
      alert('No se pudo eliminar el registro.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="h-8 w-8 text-primary" />
            Configuración del Cancionero
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los catálogos y agrupadores musicales para clasificar y organizar el repertorio
          </p>
        </div>
      </div>

      {/* Pestañas Principales de Catálogos */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as CatalogType);
          setSearchTerm('');
        }}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted rounded-xl gap-1">
          <TabsTrigger value="song_types" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Music className="h-4 w-4" />
            Tipos de Canción
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {songTypes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="themes" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4" />
            Temas Centrales
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {themes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="artists" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            Artistas y Bandas
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {artists.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="version_types" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Tag className="h-4 w-4" />
            Tipos de Versión
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {versionTypes.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <Card className="shadow-sm border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <currentConfig.icon className="h-5 w-5 text-primary" />
                  {currentConfig.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {currentConfig.subtitle}
                </CardDescription>
              </div>

              <Can resource="songs" action="manage_types">
                <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Nuevo {currentConfig.singular}
                </Button>
              </Can>
            </div>

            {/* Barra de Búsqueda Interna */}
            <div className="pt-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar en ${currentConfig.title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2.5 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-sm">Cargando catálogo...</span>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl p-6 text-center text-muted-foreground">
                <Layers className="h-8 w-8 mb-2 opacity-40" />
                <p className="font-medium text-sm">
                  {searchTerm
                    ? `No se encontraron resultados para "${searchTerm}"`
                    : `No hay registros en ${currentConfig.title}.`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {searchTerm
                    ? 'Prueba con otro término de búsqueda.'
                    : `Haz clic en "Nuevo ${currentConfig.singular}" para agregar el primero.`}
                </p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre / Categoría</TableHead>
                      <TableHead className="w-[180px]">Identificador</TableHead>
                      <TableHead className="text-right w-[140px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`font-normal text-xs ${currentConfig.badgeColor}`}>
                              {item.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          ID: #{item.id}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Can resource="songs" action="manage_types">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEdit(item)}
                                title={`Editar ${currentConfig.singular.toLowerCase()}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Can>
                            <Can resource="songs" action="delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(item)}
                                title={`Eliminar ${currentConfig.singular.toLowerCase()}`}
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
          </CardContent>
        </Card>
      </Tabs>

      {/* Diálogo Modal de Creación / Edición */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <currentConfig.icon className="h-5 w-5 text-primary" />
                {editingItem.item
                  ? `Editar ${currentConfig.singular}`
                  : `Nuevo ${currentConfig.singular}`}
              </DialogTitle>
              <DialogDescription>
                Ingresa el nombre descriptivo para este agrupador. Se validará que no existan duplicados.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <Label htmlFor="catalog-name">Nombre de {currentConfig.singular}</Label>
              <Input
                id="catalog-name"
                placeholder={currentConfig.placeholder}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !inputName.trim()} className="gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingItem.item ? 'Guardar Cambios' : 'Crear Registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
