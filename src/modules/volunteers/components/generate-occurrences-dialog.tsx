import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import type { GenerateOccurrencesData, VolunteerTask } from "../types"

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
]

interface GenerateOccurrencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: VolunteerTask | null
  onSubmit: (taskId: string, data: GenerateOccurrencesData) => Promise<void> | void
}

const currentDate = new Date()

function toDateOnlyISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}T00:00:00.000Z`
}

const currentYear = currentDate.getFullYear()

export function GenerateOccurrencesDialog({ open, onOpenChange, task, onSubmit }: GenerateOccurrencesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])

  const isCustomTask = task?.recurrence_type === "CUSTOM"

  const handleSubmit = async () => {
    if (!task) return
    setIsSubmitting(true)
    try {
      let payload: GenerateOccurrencesData
      if (isCustomTask) {
        if (selectedDates.length === 0) {
          alert("Selecciona al menos una fecha en el calendario.")
          setIsSubmitting(false)
          return
        }
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
        payload = { custom_dates: sorted.map(toDateOnlyISO) }
      } else {
        if (month < 1 || month > 12) {
          alert("El mes debe estar entre 1 y 12")
          setIsSubmitting(false)
          return
        }
        payload = { year: currentYear, month }
      }

      await onSubmit(task.id, payload)
      onOpenChange(false)
      setSelectedDates([])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Generar ocurrencias</DialogTitle>
          <DialogDescription>
            {task
              ? task.recurrence_type === "CUSTOM"
                ? `Crear ocurrencias para "${task.name}" a partir de fechas explícitas.`
                : `Crear ocurrencias para "${task.name}" en un período mensual.`
              : "Selecciona una tarea primero."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCustomTask ? (
            <div className="space-y-3">
              <Label>Selecciona las fechas</Label>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates ?? [])}
                defaultMonth={currentDate}
                locale={undefined}
                className="rounded-md border p-3"
              />
              {selectedDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[...selectedDates]
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d) => (
                      <span
                        key={d.toISOString()}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                      >
                        {d.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                        <button
                          type="button"
                          onClick={() => setSelectedDates((prev) => prev.filter((x) => x.getTime() !== d.getTime()))}
                          className="rounded p-0.5 hover:bg-muted-foreground/20"
                          aria-label="Quitar fecha"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Año: </span>
                <span className="font-medium">{currentYear}</span>
              </div>
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger id="occ-month">
                    <SelectValue placeholder="Selecciona un mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !task}>
            Generar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
