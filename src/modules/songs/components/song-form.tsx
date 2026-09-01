import React, { useState, useEffect, useMemo } from 'react';
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
  Music,
  Youtube,
  FileAudio,
  Plus,
  Loader2,
  Save,
  ArrowLeft,
  Sparkles,
  Layers,
  User,
  Copy,
  Check,
  Tv,
} from 'lucide-react';
import { songsService } from '../services/songs.service';
import { MUSICAL_KEY_LABELS, convertPlainTextToBracketed, convertBracketedToPlainText } from '../utils/chord-transposer';
import { formatSongForHolyrics } from '../utils/holyrics-formatter';
import { ChordSheetViewer } from './chord-sheet-viewer';
import { ComboboxCreatable } from './combobox-creatable';
import type { Song, MusicalKey, SongVersionType, SongArtist, SongTheme, SongTypeItem, CreateSongData } from '../types';

interface SongFormProps {
  initialData?: Song;
  isEditing?: boolean;
}

const MUSICAL_KEYS = Object.keys(MUSICAL_KEY_LABELS) as MusicalKey[];

export function SongForm({ initialData, isEditing = false }: SongFormProps) {
  const navigate = useNavigate();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [copiedHolyrics, setCopiedHolyrics] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateSongData>({
    title: initialData?.title || '',
    artist: initialData?.artist || '',
    artist_id: initialData?.artist_id || null,
    theme_id: initialData?.theme_id || null,
    song_type_id: initialData?.song_type_id || null,
    original_key: initialData?.original_key || 'G',
    version_type_id: initialData?.version_type_id || '',
    bpm: initialData?.bpm || null,
    time_signature: initialData?.time_signature || '4/4',
    content: initialData?.content ? convertBracketedToPlainText(initialData.content) : '',
    multitrack_url: initialData?.multitrack_url || '',
    youtube_url: initialData?.youtube_url || '',
    notes: initialData?.notes || '',
  });

  const [songTypes, setSongTypes] = useState<SongTypeItem[]>([]);
  const [versionTypes, setVersionTypes] = useState<SongVersionType[]>([]);
  const [artists, setArtists] = useState<SongArtist[]>([]);
  const [themes, setThemes] = useState<SongTheme[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Estado para el guardado automático (Auto-Save) en modo edición
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const lastSavedDataRef = React.useRef<string>(
    isEditing && initialData ? JSON.stringify(formData) : ''
  );
  const isInitialMount = React.useRef(true);

  // Auto-Save en modo edición con delay prudente (1800ms)
  useEffect(() => {
    if (!isEditing || !initialData) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Validar campos mínimos requeridos para no auto-guardar datos vacíos o incompletos
    if (
      !formData.title.trim() ||
      (!formData.artist && !formData.artist_id) ||
      !formData.version_type_id ||
      !formData.content.trim()
    ) {
      return;
    }

    const currentPayload = JSON.stringify(formData);
    if (currentPayload === lastSavedDataRef.current) {
      return;
    }

    setAutoSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        await songsService.updateSong(initialData.id, formData, { silent: true });
        lastSavedDataRef.current = JSON.stringify(formData);
        setAutoSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (err) {
        console.error('Error en auto-guardado:', err);
        setAutoSaveStatus('error');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [formData, isEditing, initialData]);

  // Cargar catálogos (Tipos de Canción, Tipos de Versión, Artistas, Temas Centrales)
  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true);
    try {
      const [songTypesRes, typesRes, artistsRes, themesRes] = await Promise.all([
        songsService.getAllSongTypes(),
        songsService.getAllVersionTypes(),
        songsService.getAllArtists(),
        songsService.getAllThemes(),
      ]);

      setSongTypes(songTypesRes);
      setVersionTypes(typesRes);
      setArtists(artistsRes);
      setThemes(themesRes);

      if (!formData.version_type_id && typesRes.length > 0 && !isEditing) {
        setFormData((prev) => ({ ...prev, version_type_id: typesRes[0].id }));
      }
    } catch (err) {
      console.error('Error al cargar catálogos de canciones:', err);
    } finally {
      setIsLoadingCatalogs(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Handlers para creación dinámica ("Otro...")
  const handleCreateSongType = async (name: string) => {
    try {
      const created = await songsService.createSongType(name);
      setSongTypes((prev) => {
        const exists = prev.find((t) => t.id === created.id);
        return exists ? prev : [...prev, created];
      });
      return created;
    } catch (err) {
      console.error('Error creando tipo de canción:', err);
      return null;
    }
  };

  const handleCreateVersionType = async (name: string) => {
    try {
      const created = await songsService.createVersionType(name);
      setVersionTypes((prev) => {
        const exists = prev.find((t) => t.id === created.id);
        return exists ? prev : [...prev, created];
      });
      return created;
    } catch (err) {
      console.error('Error creando tipo de versión:', err);
      return null;
    }
  };

  const handleCreateArtist = async (name: string) => {
    try {
      const created = await songsService.createArtist(name);
      setArtists((prev) => {
        const exists = prev.find((a) => a.id === created.id);
        return exists ? prev : [...prev, created];
      });
      return created;
    } catch (err) {
      console.error('Error creando artista:', err);
      return null;
    }
  };

  const handleCreateTheme = async (name: string) => {
    try {
      const created = await songsService.createTheme(name);
      setThemes((prev) => {
        const exists = prev.find((t) => t.id === created.id);
        return exists ? prev : [...prev, created];
      });
      return created;
    } catch (err) {
      console.error('Error creando tema central:', err);
      return null;
    }
  };

  // Insertar etiqueta de sección inteligente calculando el siguiente correlativo y en la posición del cursor
  const insertSmartSectionTag = (type: 'intro' | 'verso' | 'coro' | 'puente' | 'precoro' | 'outro' | 'solo') => {
    const currentContent = formData.content || '';
    let tagLabel = '';

    if (type === 'verso') {
      const matches = Array.from(currentContent.matchAll(/\[(?:verso|verse|estrofa)\s*(\d+)?\]/gi));
      const numbers = matches.map((m) => (m[1] ? parseInt(m[1], 10) : 1));
      const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      tagLabel = `VERSO ${nextNum}`;
    } else if (type === 'coro') {
      const matches = Array.from(currentContent.matchAll(/\[(?:coro|chorus|estribillo)\s*(\d+)?\]/gi));
      const numbers = matches.map((m) => (m[1] ? parseInt(m[1], 10) : 1));
      if (numbers.length === 0) {
        tagLabel = 'CORO';
      } else {
        const nextNum = Math.max(...numbers) + 1;
        tagLabel = `CORO ${nextNum}`;
      }
    } else if (type === 'puente') {
      const matches = Array.from(currentContent.matchAll(/\[(?:puente|bridge)\s*(\d+)?\]/gi));
      const numbers = matches.map((m) => (m[1] ? parseInt(m[1], 10) : 1));
      if (numbers.length === 0) {
        tagLabel = 'PUENTE';
      } else {
        const nextNum = Math.max(...numbers) + 1;
        tagLabel = `PUENTE ${nextNum}`;
      }
    } else if (type === 'precoro') {
      tagLabel = 'PRE-CORO';
    } else if (type === 'intro') {
      tagLabel = 'INTRO';
    } else if (type === 'outro') {
      tagLabel = 'OUTRO';
    } else if (type === 'solo') {
      tagLabel = 'SOLO';
    }

    const tagToInsert = `[${tagLabel}]`;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart ?? currentContent.length;
      const end = textarea.selectionEnd ?? currentContent.length;
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(end);

      // Espaciado inteligente antes y después
      const prefix = before.length === 0 ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
      const suffix = after.length === 0 ? '\n' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';

      const inserted = `${prefix}${tagToInsert}${suffix}`;
      const newContent = before + inserted + after;
      setFormData((prev) => ({ ...prev, content: newContent }));

      // Restaurar el cursor justo después de la etiqueta
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = start + inserted.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${tagToInsert}\n` : `${tagToInsert}\n`,
      }));
    }
  };

  // Copiar letra en formato Holyrics ##(...)
  const handleCopyHolyrics = () => {
    const formatted = formatSongForHolyrics(formData.content);
    if (!formatted) {
      alert('No hay letra suficiente para generar el formato de Holyrics.');
      return;
    }
    navigator.clipboard.writeText(formatted);
    setCopiedHolyrics(true);
    setTimeout(() => setCopiedHolyrics(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('El título de la canción es obligatorio.');
      return;
    }
    if (!formData.artist && !formData.artist_id) {
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

    const submissionData = {
      ...formData,
      content: formData.content,
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

        <div className="flex items-center gap-3">
          {isEditing && (
            <div className="text-xs text-muted-foreground mr-1 select-none">
              {autoSaveStatus === 'saving' && (
                <span className="flex items-center gap-1.5 text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Auto-guardando...</span>
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-150">
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    Guardado autom.{' '}
                    {lastSavedTime
                      ? lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-rose-500 font-medium">Error en auto-guardado</span>
              )}
            </div>
          )}

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
              Información musical y categorización
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

            {/* Artista / Banda con Buscador y "Otro..." */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Artista / Banda <span className="text-destructive">*</span>
              </Label>
              <ComboboxCreatable
                label="Artista"
                placeholder="Buscar o crear artista..."
                options={artists}
                value={formData.artist_id || ''}
                onChange={(id, item) => {
                  setFormData({
                    ...formData,
                    artist_id: id,
                    artist: item?.name || formData.artist,
                  });
                }}
                onCreateOption={handleCreateArtist}
                createModalTitle="Nuevo Artista o Grupo"
                createModalDescription="Ingresa el nombre del artista, banda o ministerio musical."
                createInputPlaceholder="Ej: Miel San Marcos, Hillsong..."
              />
            </div>

            {/* Tipo de Canción (Alabanza, Adoración, Intimidad...) con Buscador y "Otro..." */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-indigo-500" />
                Tipo de Canción (Momento)
              </Label>
              <ComboboxCreatable
                label="Tipo de Canción"
                placeholder="Seleccionar tipo (ej: Alabanza, Adoración)..."
                options={songTypes}
                value={formData.song_type_id || ''}
                onChange={(id) => {
                  setFormData({
                    ...formData,
                    song_type_id: id || null,
                  });
                }}
                onCreateOption={handleCreateSongType}
                createModalTitle="Nuevo Tipo de Canción"
                createModalDescription="Registra una nueva categoría litúrgica o momento de servicio (ej: Alabanza, Adoración, Intimidad Personal, Júbilo)."
                createInputPlaceholder="Ej: Intimidad Personal, Alabanza..."
              />
            </div>

            {/* Tema Central Doctrinal con Buscador y "Otro..." */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Tema Central
              </Label>
              <ComboboxCreatable
                label="Tema Central"
                placeholder="Seleccionar tema (ej: Cruz, Gratitud, Fe)..."
                options={themes}
                value={formData.theme_id || ''}
                onChange={(id) => {
                  setFormData({
                    ...formData,
                    theme_id: id || null,
                  });
                }}
                onCreateOption={handleCreateTheme}
                createModalTitle="Nuevo Tema Central"
                createModalDescription="Registra un nuevo enfoque temático o doctrinal (ej: Cruz y Redención, Espíritu Santo, Fe, Sanidad)."
                createInputPlaceholder="Ej: Cruz y Redención, Gratitud..."
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

            {/* Tipo de Versión con Buscador y "Otro..." */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                Tipo de Versión <span className="text-destructive">*</span>
              </Label>
              <ComboboxCreatable
                label="Tipo de Versión"
                placeholder="Seleccionar versión..."
                options={versionTypes}
                value={formData.version_type_id || ''}
                onChange={(id) => {
                  setFormData({
                    ...formData,
                    version_type_id: id,
                  });
                }}
                onCreateOption={handleCreateVersionType}
                createModalTitle="Nuevo Tipo de Versión"
                createModalDescription="Registra una nueva categoría de versión para las canciones."
                createInputPlaceholder="Ej: Acústica, Instrumental, En Vivo..."
              />
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
            <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-muted/40 rounded-lg border text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-muted-foreground mr-1">Secciones:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 hover:bg-primary/10 hover:text-primary"
                  onClick={() => insertSmartSectionTag('intro')}
                  title="Insertar etiqueta [INTRO] en el cursor"
                >
                  + Intro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 font-medium hover:bg-emerald-500/10 hover:text-emerald-600"
                  onClick={() => insertSmartSectionTag('verso')}
                  title="Calcula automáticamente el siguiente número: [VERSO 1], [VERSO 2]..."
                >
                  + Verso
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 font-medium hover:bg-blue-500/10 hover:text-blue-600"
                  onClick={() => insertSmartSectionTag('coro')}
                  title="Inserta [CORO], [CORO 2] en el cursor"
                >
                  + Coro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 hover:bg-indigo-500/10 hover:text-indigo-600"
                  onClick={() => insertSmartSectionTag('precoro')}
                  title="Inserta [PRE-CORO] en el cursor"
                >
                  + Pre-Coro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 font-medium hover:bg-amber-500/10 hover:text-amber-600"
                  onClick={() => insertSmartSectionTag('puente')}
                  title="Inserta [PUENTE], [PUENTE 2] en el cursor"
                >
                  + Puente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 hover:bg-purple-500/10 hover:text-purple-600"
                  onClick={() => insertSmartSectionTag('solo')}
                  title="Inserta [SOLO] en el cursor"
                >
                  + Solo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 hover:bg-muted"
                  onClick={() => insertSmartSectionTag('outro')}
                  title="Inserta [OUTRO] en el cursor"
                >
                  + Outro
                </Button>
              </div>

              {/* Botón de exportación rápida para Holyrics */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5 font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30"
                onClick={handleCopyHolyrics}
                title="Genera y copia al portapapeles la letra con diapositivas ##(verso 1.1), ##(coro 1.1) para pegar en Holyrics"
              >
                {copiedHolyrics ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>¡Copiado para Holyrics!</span>
                  </>
                ) : (
                  <>
                    <Tv className="h-3.5 w-3.5" />
                    <span>📋 Copiar formato Holyrics</span>
                  </>
                )}
              </Button>
            </div>

            {activeTab === 'editor' ? (
              <div className="flex-1 min-h-[420px] flex flex-col">
                <Textarea
                  ref={textareaRef}
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
    </form>
  );
}
