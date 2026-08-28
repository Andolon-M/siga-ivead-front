import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export interface CreatableOption {
  id: string;
  name: string;
}

interface ComboboxCreatableProps {
  label: string;
  placeholder?: string;
  options: CreatableOption[];
  value: string;
  onChange: (id: string, item?: CreatableOption) => void;
  onCreateOption: (name: string) => Promise<CreatableOption | null>;
  disabled?: boolean;
  createModalTitle?: string;
  createModalDescription?: string;
  createInputPlaceholder?: string;
}

export function ComboboxCreatable({
  label,
  placeholder = 'Seleccionar...',
  options,
  value,
  onChange,
  onCreateOption,
  disabled = false,
  createModalTitle,
  createModalDescription,
  createInputPlaceholder = 'Escribe el nombre...',
}: ComboboxCreatableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click afuera
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

  // Autofoco en el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Opción seleccionada actualmente
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.id === value);
  }, [options, value]);

  // Filtrado en vivo de opciones
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options;
    return options.filter((opt) => opt.name.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Handler para crear nueva opción
  const handleCreate = async () => {
    if (!newOptionName.trim()) return;

    setIsCreating(true);
    try {
      const created = await onCreateOption(newOptionName.trim());
      if (created) {
        onChange(created.id, created);
        setNewOptionName('');
        setIsModalOpen(false);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error creando nueva opción:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = (initialText?: string) => {
    setNewOptionName(initialText || searchTerm || '');
    setIsModalOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botón Disparador del Combobox */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between font-normal text-left h-10 px-3 bg-background hover:bg-muted/40"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.name : <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Menú Desplegable con Buscador */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Input de Búsqueda Rápida */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b mb-1">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 w-full border-0 p-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length === 1) {
                    onChange(filteredOptions[0].id, filteredOptions[0]);
                    setIsOpen(false);
                  } else if (filteredOptions.length === 0 && searchTerm.trim()) {
                    openCreateModal(searchTerm.trim());
                  }
                }
              }}
            />
          </div>

          {/* Lista de Opciones Scrolleable */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 py-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id, opt);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1.5" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No se encontraron resultados.
              </div>
            )}
          </div>

          {/* Opción permanente "Otro / Crear nuevo" */}
          <div className="border-t mt-1 pt-1">
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-primary hover:bg-primary/10 transition-colors font-medium cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>
                {searchTerm.trim() ? `Crear "${searchTerm.trim()}"...` : `Otro (Crear ${label.toLowerCase()})...`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modal / Diálogo para crear nuevo ítem */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{createModalTitle || `Nuevo ${label}`}</DialogTitle>
            <DialogDescription>
              {createModalDescription ||
                `Ingresa el nombre para guardarlo como un nuevo ${label.toLowerCase()} disponible en el catálogo.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoFocus
              type="text"
              placeholder={createInputPlaceholder}
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
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
                setNewOptionName('');
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !newOptionName.trim()}
              className="gap-1.5"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar y Seleccionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
