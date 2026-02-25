import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

export interface SearchableEntitySelectorProps<T extends { id: string }> {
  /** ID del ítem seleccionado (controlado) */
  value?: string
  /** Callback al seleccionar: recibe id y el objeto completo, o undefined al limpiar */
  onSelect: (id: string | undefined, item: T | undefined) => void
  /** Lista de ítems (ya filtrada por búsqueda si aplica) */
  items: T[]
  /** Carga en curso (ej. búsqueda o fetch) */
  loading?: boolean
  /** Se llama cuando cambia el texto de búsqueda; el padre debe refetch y pasar nuevos items */
  onSearchChange?: (query: string) => void
  /** Obtener el id del ítem (por defecto item => item.id) */
  getItemId?: (item: T) => string
  /** Contenido del botón trigger cuando hay selección */
  renderTrigger: (selected: T | undefined) => React.ReactNode
  /** Contenido de cada opción en la lista */
  renderItem: (item: T) => React.ReactNode
  /** Texto cuando no hay selección */
  placeholder?: string
  /** Texto cuando la lista está vacía (sin resultados) */
  emptyMessage?: string
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string
  /** Mostrar opción "(Ninguno)" para limpiar selección */
  allowClear?: boolean
  /** Clases adicionales para el trigger */
  className?: string
  /** Ancho del popover (ej. "400px") */
  popoverWidth?: string
  /** Mínimo de caracteres para ejecutar búsqueda (por defecto 3) */
  minSearchLength?: number
  /** Tiempo de espera en ms tras dejar de escribir para ejecutar búsqueda (por defecto 1000) */
  searchDebounceMs?: number
}

/**
 * Selector genérico con búsqueda integrada.
 * Reutilizable desde cualquier módulo: recibe items y callbacks de búsqueda y selección.
 * Entrega id y datos completos del ítem seleccionado en onSelect.
 */
export function SearchableEntitySelector<T extends { id: string }>({
  value,
  onSelect,
  items,
  loading = false,
  onSearchChange,
  getItemId = (item) => item.id,
  renderTrigger,
  renderItem,
  placeholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados",
  searchPlaceholder = "Buscar...",
  allowClear = true,
  className,
  popoverWidth = "400px",
  minSearchLength = 3,
  searchDebounceMs = 1000,
}: SearchableEntitySelectorProps<T>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedItem = items.find((item) => getItemId(item) === value)

  // Debounce: ejecutar búsqueda 1s después de dejar de escribir, y solo si hay >= 3 caracteres (o vacío)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      const shouldSearch = searchQuery.length >= minSearchLength || searchQuery === ""
      if (shouldSearch) {
        onSearchChange?.(searchQuery)
      }
    }, searchDebounceMs)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, minSearchLength, searchDebounceMs, onSearchChange])

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
  }

  const handleSelect = (id: string) => {
    if (id === "none") {
      onSelect(undefined, undefined)
      setOpen(false)
      return
    }
    const item = items.find((i) => getItemId(i) === id)
    onSelect(id, item)
    setOpen(false)
  }

  const handleToggleSelect = (currentId: string) => {
    if (currentId === value) {
      onSelect(undefined, undefined)
    } else {
      const item = items.find((i) => getItemId(i) === currentId)
      onSelect(currentId, item)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedItem ? renderTrigger(selectedItem) : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: popoverWidth }} align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : searchQuery.length > 0 && searchQuery.length < minSearchLength ? (
              <div className="py-6 text-center text-sm text-muted-foreground px-2">
                Escribe al menos {minSearchLength} caracteres para buscar
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {allowClear && value && (
                    <CommandItem
                      value="none"
                      onSelect={() => handleSelect("none")}
                      className="text-muted-foreground"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      (Ninguno)
                    </CommandItem>
                  )}
                  {items.map((item) => {
                    const id = getItemId(item)
                    return (
                      <CommandItem
                        key={id}
                        value={id}
                        onSelect={() => handleToggleSelect(id)}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", value === id ? "opacity-100" : "opacity-0")}
                        />
                        {renderItem(item)}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
