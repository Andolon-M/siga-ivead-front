import { useMemo } from "react"
import { addDays, format, isSameDay, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

interface DayFilterProps {
  /** Fecha seleccionada actualmente */
  selectedDate: Date | null
  /** Callback cuando se selecciona un día */
  onDateSelect: (date: Date) => void
  /** Número de días a mostrar (por defecto 14) */
  daysToShow?: number
  /** Fecha de inicio (por defecto hoy) */
  startDate?: Date
  className?: string
}

export function DayFilter({
  selectedDate,
  onDateSelect,
  daysToShow = 30,
  startDate = new Date(),
  className,
}: DayFilterProps) {
  const days = useMemo(() => {
    return Array.from({ length: daysToShow }, (_, i) =>
      addDays(startOfDay(startDate), i)
    )
  }, [daysToShow, startDate])

  const today = startOfDay(new Date())

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Filtrar por fecha
        </span>
        <span className="text-muted-foreground cursor-help" title="Selecciona un día para ver los servicios">
          ℹ️
        </span>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {days.map((day) => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
            const isToday = isSameDay(day, today)

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onDateSelect(day)}
                className={cn(
                  "flex flex-col items-center min-w-[72px] px-4 py-3 rounded-lg border-2 transition-all",
                  "hover:bg-accent/50 hover:border-accent-foreground/20",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground",
                  isToday && !isSelected && "border-primary/50"
                )}
              >
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-lg font-bold">{format(day, "d")}</span>
                <span className="text-xs text-muted-foreground lowercase">
                  {format(day, "MMM", { locale: es })}
                </span>
                {isToday && (
                  <span className="text-xs font-medium text-primary mt-1">Hoy</span>
                )}
              </button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
