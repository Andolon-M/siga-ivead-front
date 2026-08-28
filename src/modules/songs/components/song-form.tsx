import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Music,
  Youtube,
  FileAudio,
  Sparkles,
  Plus,
  Loader2,
  Save,
  ArrowLeft,
  Wand2,
} from 'lucide-react';
import type { Song, CreateSongData, MusicalKey, SongVersionType } from '../types';
import { songsService } from '../services/songs.service';
import { MUSICAL_KEY_LABELS, convertPlainTextToBracketed } from '../utils/chord-transposer';
import { ChordSheetViewer } from './chord-sheet-viewer';

interface SongFormProps {
  initialData?: Song;
  isEditing?: boolean;
}

const MUSICAL_KEYS = Object.keys(MUSICAL_KEY_LABELS) as MusicalKey[];

export function SongForm({ initialData, isEditing = false }: SongFormProps) {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<CreateSongData>({
    title: initialData?.title || '',
    artist: initialData?.artist || '',
    original_key: initialData?.original_key || 'G',
    version_type_id: initialData?.version_type_id || '',
    bpm: initialData?.bpm || null,
    time_signature: initialData?.time_signature || '4/4',
    content: initialData?.content || '',
    multitrack_url: initialData?.multitrack_url || '',
    youtube_url: initialData?.youtube_url || '',
    notes: initialData?.notes || '',
  });

  const [versionTypes, setVersionTypes] = useState<SongVersionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Modal para nuevo tipo de versión
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isCreatingType, setIsCreatingType] = useState(false);

  // Cargar tipos de versión
  const loadVersionTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const types = await songsService.getAllVersionTypes();
      setVersionTypes(types);
      if (!formData.version_type_id && types.length > 0) {
        setFormData((prev) => ({ ...prev, version_type_id: types[0].id }));
      }
    } catch (err) {
      console.error('Error al cargar tipos de versión:', err);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    loadVersionTypes();
  }, []);

  const handleCreateVersionType = async () => {
    if (!newTypeName.trim()) return;

    setIsCreatingType(true);
    try {
      const created = await songsService.createVersionType(newTypeName.trim());
      setVersionTypes((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, version_type_id: created.id }));
      setNewTypeName('');
      setIsNewTypeModalOpen(false);
    } catch (err) {
      console.error('Error al crear tipo de versión:', err);
      alert('No se pudo crear el tipo de versión.');
    } finally {
      setIsCreatingType(false);
    }
  };

  // Convertidor de texto plano a formato bracketed [G]
  const handleAutoConvertPlainText = () => {
    if (!formData.content.trim()) return;

    const converted = convertPlainTextToBracketed(formData.content);
    setFormData((prev) => ({ ...prev, content: converted }));
  };

  // Insertar etiqueta de sección
  const insertSectionTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n[${tag}]\n` : `[${tag}]\n`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('El título de la canción es obligatorio.');
      return;
    }
    if (!formData.artist.trim()) {
      alert('El artista o grupo es obligatorio.');
      return;
    }
    if (!formData.version_type_id) {
      alert('Debes seleccionar un tipo de versión.');
      return;
    }
    if (!formData.content.trim()) {
      alert('Debes ingresar la letra o acordes de la canción.');
      return;
    }

    // Auto-convertir si el texto está en formato plano de 2 líneas
    const finalContent = formData.content.includes('[')
      ? formData.content
      : convertPlainTextToBracketed(formData.content);

    const submissionData = {
      ...formData,
      content: finalContent,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        await songsService.updateSong(initialData.id, submissionData);
        navigate(`/admin/songs/${initialData.id}`);
      } else {
        const created = await songsService.createSong(submissionData);
        navigate(`/admin/songs/${created.id}`);
      }
    } catch (err) {
      console.error('Error al guardar canción:', err);
      alert('Ocurrió un error al guardar la canción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/songs')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Editar Canción' : 'Nueva Canción'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? 'Actualiza los acordes, tonalidad y enlaces de la canción'
                : 'Registra una nueva canción en el cancionero de la iglesia'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/songs')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Guardar Cambios' : 'Crear Canción'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metadatos Generales (Columna Izquierda) */}
        <Card className="md:col-span-1 space-y-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Datos de la Canción
            </CardTitle>
            <CardDescription className="text-xs">
              Información musical y técnica básica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Título */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Grande y Fuerte"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Artista */}
            <div className="space-y-1.5">
              <Label htmlFor="artist" className="text-xs font-semibold">
                Artista / Banda <span className="text-destructive">*</span>
              </Label>
              <Input
                id="artist"
                placeholder="Ej: Miel San Marcos"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required
              />
            </div>

            {/* Tonalidad Original */}
            <div className="space-y-1.5">
              <Label htmlFor="key" className="text-xs font-semibold">
                Tonalidad Original <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.original_key}
                onValueChange={(val) => setFormData({ ...formData, original_key: val as MusicalKey })}
              >
                <SelectTrigger id="key">
                  <SelectValue placeholder="Selecciona el tono" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {MUSICAL_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {MUSICAL_KEY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Versión */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="version_type" className="text-xs font-semibold">
                  Tipo de Versión <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setIsNewTypeModalOpen(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="h-3 w-3" /> Nuevo
                </button>
              </div>
              <Select
                value={formData.version_type_id}
                onValueChange={(val) => setFormData({ ...formData, version_type_id: val })}
                disabled={isLoadingTypes}
              >
                <SelectTrigger id="version_type">
                  <SelectValue placeholder="Selecciona tipo de versión" />
                </SelectTrigger>
                <SelectContent>
                  {versionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BPM y Compás */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bpm" className="text-xs font-semibold">
                  Tempo (BPM)
                </Label>
                <Input
                  id="bpm"
                  type="number"
                  placeholder="Ej: 128"
                  value={formData.bpm || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bpm: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="time_signature" className="text-xs font-semibold">
                  Compás
                </Label>
                <Input
                  id="time_signature"
                  placeholder="Ej: 4/4, 6/8"
                  value={formData.time_signature || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, time_signature: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Enlace YouTube */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label htmlFor="youtube_url" className="text-xs font-semibold flex items-center gap-1.5 text-rose-600">
                <Youtube className="h-3.5 w-3.5" />
                Enlace a YouTube
              </Label>
              <Input
                id="youtube_url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtube_url || ''}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              />
            </div>

            {/* Enlace Multitrack */}
            <div className="space-y-1.5">
              <Label htmlFor="multitrack_url" className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600">
                <FileAudio className="h-3.5 w-3.5" />
                Enlace a Multitrack / Secuencia
              </Label>
              <Input
                id="multitrack_url"
                placeholder="https://secuencias.com/... o Drive"
                value={formData.multitrack_url || ''}
                onChange={(e) => setFormData({ ...formData, multitrack_url: e.target.value })}
              />
            </div>

            {/* Notas adicionales */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Notas del Arreglo / Estructura
              </Label>
              <Textarea
                id="notes"
                placeholder="Ej: Intro piano solo, sube de tono en el puente..."
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor de Letra y Acordes con Vista Previa (Columna Derecha) */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Letra y Acordes</CardTitle>
              <CardDescription className="text-xs">
                Pega directamente la canción desde CifraClub, LaCuerda o escribe los acordes sobre la letra
              </CardDescription>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="editor" className="text-xs px-3">
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-3">
                  Vista Previa
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col pt-0 space-y-3">
            {/* Barra de herramientas rápidas */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 rounded-lg border text-xs">
              <span className="font-semibold text-muted-foreground mr-1">Secciones:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => insertSectionTag('Intro')}
              >
                + Intro
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => insertSectionTag('Verso 1')}
              >
                + Verso
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => insertSectionTag('Coro')}
              >
                + Coro
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => insertSectionTag('Puente')}
              >
                + Puente
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => insertSectionTag('Outro')}
              >
                + Outro
              </Button>

              <div className="ml-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs px-2.5 gap-1.5 bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={handleAutoConvertPlainText}
                  title="Convierte texto plano o pegado de CifraClub/LaCuerda al formato sincronizado"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Auto-Alinear Acordes
                </Button>
              </div>
            </div>

            {activeTab === 'editor' ? (
              <div className="flex-1 min-h-[420px] flex flex-col">
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={`Pega aquí los acordes sobre la letra como en CifraClub o LaCuerda:\n\n[Intro]\nAm   F7M   Em7   Am   F7M\n\n[Verso 1]\nAm            F7M       Em7     Am   F7M  \n   Grande y fuerte es nuestro Dios`}
                  className="flex-1 font-mono text-sm leading-relaxed p-4 h-[420px] resize-y"
                  required
                />
              </div>
            ) : (
              <div className="flex-1 min-h-[420px] p-4 bg-muted/20 border rounded-lg overflow-y-auto">
                {formData.content.trim() ? (
                  <ChordSheetViewer content={formData.content} showChords={true} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Escribe letra y acordes en la pestaña Editor para ver el resultado aquí.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para crear nuevo tipo de versión */}
      <Dialog open={isNewTypeModalOpen} onOpenChange={setIsNewTypeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Tipo de Versión</DialogTitle>
            <DialogDescription>
              Crea una nueva clasificación para versiones de canciones (ej: "Versión Congreso", "Gospel", etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="new-type-name">Nombre de la Versión</Label>
            <Input
              id="new-type-name"
              placeholder="Ej: Versión Especial 2026"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateVersionType();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewTypeModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateVersionType}
              disabled={isCreatingType || !newTypeName.trim()}
            >
              {isCreatingType && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
