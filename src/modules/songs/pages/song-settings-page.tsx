import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Users,
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Layers,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import {
  Tabs,
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
import type { SongTag, SongArtist, SongVersionType } from '../types';
import { songsService } from '../services/songs.service';

type CatalogType = 'tags' | 'artists' | 'version_types';

interface CatalogItem {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export function SongSettingsPage() {
  const [activeTab, setActiveTab] = useState<CatalogType>('tags');

  // Estados de datos para cada catálogo
  const [tags, setTags] = useState<SongTag[]>([]);
  const [artists, setArtists] = useState<SongArtist[]>([]);
  const [versionTypes, setVersionTypes] = useState<SongVersionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtro de búsqueda por catálogo
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: CatalogType; item: CatalogItem | null }>({
    type: 'tags',
    item: null,
  });
  const [inputName, setInputName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar todos los catálogos
  const loadAllCatalogs = async () => {
    setIsLoading(true);
    try {
      const [tagsRes, artistsRes, versionsRes] = await Promise.all([
        songsService.getAllTags(),
        songsService.getAllArtists(),
        songsService.getAllVersionTypes(),
      ]);

      setTags(tagsRes);
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
    if (activeTab === 'tags') list = tags;
    else if (activeTab === 'artists') list = artists;
    else if (activeTab === 'version_types') list = versionTypes;

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter((item) => item.name.toLowerCase().includes(term));
  }, [activeTab, tags, artists, versionTypes, searchTerm]);

  // Configuración de textos por pestaña
  const tabConfig = {
    tags: {
      title: 'Etiquetas de Canción',
      subtitle: 'Clasifica las canciones por momentos litúrgicos, propósitos o temas doctrinales (ej: Alabanza, Adoración, Agradecimiento, Sanidad, Perdón, Llenura del Espíritu Santo)',
      icon: Tag,
      singular: 'Etiqueta',
      placeholder: 'Ej: Agradecimiento, Sanidad, Llenura del Espíritu Santo',
      badgeColor: 'bg-primary/10 text-primary border-primary/30',
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
      icon: Layers,
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

      if (type === 'tags') {
        if (item) await songsService.updateTag(item.id, name);
        else await songsService.createTag(name);
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
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}" de este catálogo?\n\nLas canciones que lo usen NO serán eliminadas, solo quedarán sin esta etiqueta asignada.`)) {
      return;
    }

    try {
      if (activeTab === 'tags') await songsService.deleteTag(item.id);
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
            Administra las etiquetas, artistas y formatos para clasificar y organizar el repertorio
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
        <TabsList className="grid grid-cols-3 h-auto p-1 bg-muted rounded-xl gap-1 max-w-2xl">
          <TabsTrigger value="tags" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Tag className="h-4 w-4" />
            Etiquetas
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {tags.length}
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
            <Layers className="h-4 w-4" />
            Tipos de Versión
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {versionTypes.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <Card className="shadow-sm border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <currentConfig.icon className="h-5 w-5 text-primary" />
                  {currentConfig.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {currentConfig.subtitle}
                </CardDescription>
              </div>

              <Can resource="songs" action="create">
                <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Nueva {currentConfig.singular}
                </Button>
              </Can>
            </div>

            {/* Barra de Búsqueda */}
            <div className="pt-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar ${currentConfig.title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Cargando catálogo...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl space-y-3">
                <currentConfig.icon className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">No se encontraron registros</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchTerm
                      ? `No hay coincidencias para "${searchTerm}" en este catálogo.`
                      : `Aún no has registrado ningún elemento en ${currentConfig.title.toLowerCase()}.`}
                  </p>
                </div>
                <Can resource="songs" action="create">
                  <Button variant="outline" size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    Crear primer elemento
                  </Button>
                </Can>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Identificador</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs font-normal ${currentConfig.badgeColor}`}>
                              {item.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          #{item.id}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Can resource="songs" action="create">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEdit(item)}
                                title="Editar nombre"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </Can>
                            <Can resource="songs" action="delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(item)}
                                title="Eliminar registro"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal para Crear / Editar Registro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingItem.item ? `Editar ${currentConfig.singular}` : `Nueva ${currentConfig.singular}`}
              </DialogTitle>
              <DialogDescription>
                {editingItem.item
                  ? `Modifica el nombre para este registro en el catálogo.`
                  : `Ingresa el nombre del nuevo elemento que deseas agregar al catálogo.`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-2">
              <Label htmlFor="catalog-item-name" className="text-xs font-semibold">
                Nombre del {currentConfig.singular} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="catalog-item-name"
                autoFocus
                placeholder={currentConfig.placeholder}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
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
