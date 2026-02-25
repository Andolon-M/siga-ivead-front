import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

interface SearchInputProps {
  /** Callback que se ejecuta después del debounce con el término de búsqueda */
  onSearch: (query: string) => void
  /** Placeholder del input */
  placeholder?: string
  /** Tiempo de espera en milisegundos antes de ejecutar la búsqueda (default: 1000ms) */
  debounceMs?: number
  /** Mínimo de caracteres para ejecutar la búsqueda; si es menor, no se llama a onSearch salvo que esté vacío (default: 3) */
  minSearchLength?: number
  /** Indica visualmente que se está realizando una búsqueda */
  isSearching?: boolean
  /** Clases CSS adicionales para el contenedor */
  className?: string
  /** Valor inicial del input */
  defaultValue?: string
}

/**
 * Componente de búsqueda con debounce y mínimo de caracteres.
 *
 * - No ejecuta la búsqueda hasta que se ingresen al menos 3 caracteres (configurable).
 * - Espera 1 segundo tras dejar de escribir antes de ejecutar la búsqueda.
 * - Si se borra el texto, se ejecuta onSearch("") de inmediato para limpiar resultados.
 *
 * @example
 * ```tsx
 * <SearchInput
 *   onSearch={(query) => setSearchQuery(query)}
 *   placeholder="Buscar por nombre o DNI..."
 *   isSearching={isLoading}
 * />
 * ```
 */
export function SearchInput({
  onSearch,
  placeholder = "Buscar...",
  debounceMs = 1000,
  minSearchLength = 3,
  isSearching = false,
  className,
  defaultValue = "",
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const [isDebouncing, setIsDebouncing] = useState(false)
  
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  useEffect(() => {
    const trimmed = inputValue.trim()

    // Si está vacío, ejecutar búsqueda de inmediato (limpiar resultados)
    if (trimmed === "") {
      onSearchRef.current("")
      setIsDebouncing(false)
      return
    }

    // Menos de minSearchLength caracteres: no ejecutar búsqueda
    if (trimmed.length < minSearchLength) {
      setIsDebouncing(false)
      return
    }

    setIsDebouncing(true)

    const timer = setTimeout(() => {
      onSearchRef.current(trimmed)
      setIsDebouncing(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [inputValue, debounceMs, minSearchLength])

  return (
    <div className={cn("min-w-0", className)}>
      {/* Input + icon en un solo bloque para que el icono no se desplace al mostrar el mensaje */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isDebouncing || isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10"
        />
      </div>
      {inputValue.trim().length > 0 && inputValue.trim().length < minSearchLength && (
        <p className="mt-1.5 max-w-full wrap-break-word text-xs text-muted-foreground">
          Escribe al menos {minSearchLength} caracteres para buscar
        </p>
      )}
    </div>
  )
}

