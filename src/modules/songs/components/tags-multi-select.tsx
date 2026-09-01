import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Search, Loader2, X, Tag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { SongTag } from '../types';

interface TagsMultiSelectProps {
  label?: string;
  placeholder?: string;
  options: SongTag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreateOption: (name: string) => Promise<SongTag | null>;
  disabled?: boolean;
}

export function TagsMultiSelect({
  label = 'Etiquetas',
  placeholder = 'Seleccionar etiquetas (ej: Alabanza, Adoración, Sanidad)...',
  options,
  selectedIds = [],
  onChange,
  onCreateOption,
  disabled = false,
}: TagsMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Autofoco en el input al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedTags = useMemo(() => {
    return options.filter((opt) => selectedIds.includes(opt.id));
  }, [options, selectedIds]);

  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options;
    return options.filter((opt) => opt.name.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const toggleTag = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  const handleCreate = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    try {
      const created = await onCreateOption(newTagName.trim());
      if (created) {
        if (!selectedIds.includes(created.id)) {
          onChange([...selectedIds, created.id]);
        }
        setNewTagName('');
        setIsModalOpen(false);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error creando nueva etiqueta:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = (initialText?: string) => {
    setNewTagName(initialText || searchTerm || '');
    setIsModalOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full space-y-2" ref={dropdownRef}>
      {/* Botón Disparador del Selector */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between font-normal text-left min-h-10 h-auto py-2 px-3 bg-background hover:bg-muted/40 flex-wrap gap-1.5"
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Tag className="h-3.5 w-3.5 text-primary shrink-0 opacity-70" />
          {selectedTags.length === 0 ? (
            <span className="text-xs text-muted-foreground truncate">{placeholder}</span>
          ) : (
            <span className="text-xs font-medium text-foreground">
              {selectedTags.length} etiqueta{selectedTags.length !== 1 ? 's' : ''} seleccionada{selectedTags.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Lista de Badges Seleccionados con botón de eliminar */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs py-1 px-2.5 gap-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={(e) => removeTag(tag.id, e)}
                className="rounded-full hover:bg-primary/20 p-0.5 transition-colors cursor-pointer"
                title="Eliminar etiqueta"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Menú Desplegable con Buscador y Checkboxes */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[260px] rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Input de Búsqueda */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b mb-1">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar o filtrar etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 w-full border-0 p-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length === 1) {
                    toggleTag(filteredOptions[0].id);
                  } else if (filteredOptions.length === 0 && searchTerm.trim()) {
                    openCreateModal(searchTerm.trim());
                  }
                }
              }}
            />
          </div>

          {/* Lista de Opciones */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 py-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTag(opt.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-primary/15 text-primary font-semibold'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5" />}
                      </div>
                      <span className="truncate">{opt.name}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No se encontraron etiquetas.
              </div>
            )}
          </div>

          {/* Opción para crear nueva etiqueta */}
          <div className="border-t mt-1 pt-1">
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-primary hover:bg-primary/10 transition-colors font-medium cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>
                {searchTerm.trim()
                  ? `Crear etiqueta "${searchTerm.trim()}"...`
                  : 'Nueva etiqueta (Agradecimiento, Sanidad, etc.)...'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear nueva etiqueta */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Etiqueta</DialogTitle>
            <DialogDescription>
              Crea una nueva etiqueta temática o litúrgica (ej: Agradecimiento, Alabanza, Adoración, Sanidad, Perdón, Llenura del Espíritu Santo).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoFocus
              type="text"
              placeholder="Ej: Agradecimiento, Sanidad..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setNewTagName('');
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !newTagName.trim()}
              className="gap-1.5"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar y Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
