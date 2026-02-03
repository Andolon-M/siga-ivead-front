import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"
import type { RecurringMeeting } from "../types"

export type ServiceFilterType = "all" | string

interface ServiceFilter {
  id: ServiceFilterType
  label: string
  color?: string
}

// Filtros predefinidos basados en el diseño de referencia
const DEFAULT_FILTERS: ServiceFilter[] = [
  { id: "all", label: "Todos los tipos" },
  { id: "DOMINGO", label: "Domingo", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { id: "ensayo", label: "Ensayo", color: "bg-amber-500/20 text-amber-600 dark:text-amber-400" },
  { id: "reunion", label: "Reunión", color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
  { id: "jovenes", label: "Jóvenes", color: "bg-pink-500/20 text-pink-600 dark:text-pink-400" },
  { id: "DIACONADO", label: "Anfitriones", color: "bg-violet-500/20 text-violet-600 dark:text-violet-400" },
  { id: "SONIDO", label: "Audio", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
  { id: "iluminacion", label: "Iluminación", color: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
  { id: "DIRECTOR_CULTO", label: "Liderazgo", color: "bg-green-700/20 text-green-600 dark:text-green-400" },
  { id: "MULTIMEDIA", label: "Multimedia", color: "bg-violet-500/20 text-violet-600 dark:text-violet-400" },
  { id: "MUSICA", label: "Música", color: "bg-rose-500/20 text-rose-600 dark:text-rose-400" },
  { id: "redes", label: "Redes Sociales", color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400" },
  { id: "video", label: "Video", color: "bg-blue-600/20 text-blue-600 dark:text-blue-400" },
]

interface ServiceFiltersProps {
  /** Filtro activo */
  activeFilter: ServiceFilterType
  /** Callback cuando cambia el filtro */
  onFilterChange: (filter: ServiceFilterType) => void
  /** Reuniones para generar filtros dinámicos por nombre */
  meetings?: RecurringMeeting[]
  className?: string
}

export function ServiceFilters({
  activeFilter,
  onFilterChange,
  meetings = [],
  className,
}: ServiceFiltersProps) {
  // Combinar filtros predefinidos con reuniones únicas
  const filters = [...DEFAULT_FILTERS]

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Filtros
        </span>
        <span className="text-muted-foreground cursor-help" title="Filtra por tipo de servicio">
          ℹ️
        </span>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "hover:opacity-90",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : filter.color ?? "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {filter.label}
              </button>
            )
          })}
          {meetings
            .filter((m) => !filters.some((f) => f.id === m.id))
            .slice(0, 5)
            .map((meeting) => {
              const isActive = activeFilter === meeting.id
              return (
                <button
                  key={meeting.id}
                  type="button"
                  onClick={() => onFilterChange(meeting.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    "bg-muted text-muted-foreground hover:bg-muted/80",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  {meeting.name}
                </button>
              )
            })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
