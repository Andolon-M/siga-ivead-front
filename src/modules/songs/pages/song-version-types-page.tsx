import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
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
import { Can } from '@/shared/components/auth/can';
import type { SongVersionType } from '../types';
import { songsService } from '../services/songs.service';

export function SongVersionTypesPage() {
  const [types, setTypes] = useState<SongVersionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SongVersionType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadTypes = async () => {
    setIsLoading(true);
    try {
      const data = await songsService.getAllVersionTypes();
      setTypes(data);
    } catch (err) {
      console.error('Error al cargar tipos de versión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleOpenCreate = () => {
    setEditingType(null);
    setTypeName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: SongVersionType) => {
    setEditingType(type);
    setTypeName(type.name);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    setIsSaving(true);
    try {
      if (editingType) {
        await songsService.updateVersionType(editingType.id, typeName.trim());
      } else {
        await songsService.createVersionType(typeName.trim());
      }
      setIsModalOpen(false);
      await loadTypes();
    } catch (err) {
      console.error('Error al guardar tipo de versión:', err);
      alert('Ocurrió un error al guardar el tipo de versión.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: SongVersionType) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el tipo de versión "${type.name}"?`)) return;

    try {
      await songsService.deleteVersionType(type.id);
      await loadTypes();
    } catch (err) {
      console.error('Error al eliminar tipo de versión:', err);
      alert('No se pudo eliminar el tipo de versión.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Versión</h1>
          <p className="text-muted-foreground">
            Clasificaciones y formatos para las canciones del repertorio (ej: En Vivo, Acústica, Multitrack)
          </p>
        </div>

        <Can resource="songs" action="manage_types">
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Tipo
          </Button>
        </Can>
      </div>

      {/* Tabla de Tipos de Versión */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Catálogo de Tipos de Versión
          </CardTitle>
          <CardDescription className="text-xs">
            Utilizados para distinguir versiones específicas de cada canto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : types.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No hay tipos de versión configurados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium text-foreground">
                      {type.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Can resource="songs" action="manage_types">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(type)}
                            title="Editar nombre"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(type)}
                            title="Eliminar tipo"
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
          )}
        </CardContent>
      </Card>

      {/* Modal Crear / Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Editar Tipo de Versión' : 'Nuevo Tipo de Versión'}
              </DialogTitle>
              <DialogDescription>
                {editingType
                  ? 'Modifica el nombre del tipo de versión existente'
                  : 'Ingresa el nombre del nuevo tipo de versión para clasificar canciones'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Label htmlFor="version-name">Nombre</Label>
              <Input
                id="version-name"
                placeholder="Ej: Versión Juvenil, Estudio..."
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !typeName.trim()}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
