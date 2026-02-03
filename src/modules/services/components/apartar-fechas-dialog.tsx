import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Input } from "@/shared/components/ui/input"
import type { RecurringMeeting, GenerateSessionsRequest } from "../types"

interface ApartarFechasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetings: RecurringMeeting[]
  onSubmit: (data: GenerateSessionsRequest) => Promise<unknown>
}

const MONTHS = [
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

export function ApartarFechasDialog({
  open,
  onOpenChange,
  meetings,
  onSubmit,
}: ApartarFechasDialogProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [recurringMeetingId, setRecurringMeetingId] = useState<string>("")
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!recurringMeetingId) return

    try {
      setIsSubmitting(true)
      const result = await onSubmit({
        recurring_meeting_id: recurringMeetingId,
        year,
        month,
      })
      onOpenChange(false)
      setRecurringMeetingId("")
    } catch (error) {
      console.error("Error al generar sesiones:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMeeting = meetings.find((m) => m.id === recurringMeetingId)
  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apartar fechas</DialogTitle>
          <DialogDescription>
            Genera las sesiones del mes para un servicio. Esto creará automáticamente
            las fechas según la recurrencia configurada (ej: todos los domingos).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Servicio</Label>
            <Select
              value={recurringMeetingId}
              onValueChange={setRecurringMeetingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {meetings
                  .filter((m) => m.is_active)
                  .map((meeting) => (
                    <SelectItem key={meeting.id} value={meeting.id}>
                      {meeting.name}
                      {meeting.day_of_week && (
                        <span className="text-muted-foreground ml-1">
                          ({meeting.day_of_week})
                        </span>
                      )}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {meetings.filter((m) => m.is_active).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay servicios activos. Crea uno primero.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Mes</Label>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Año</Label>
              <Input
                type="number"
                min={currentYear - 1}
                max={currentYear + 2}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
              />
            </div>
          </div>
          {selectedMeeting && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              Se generarán las sesiones de{" "}
              <strong className="text-foreground">{selectedMeeting.name}</strong> para{" "}
              <strong className="text-foreground">
                {monthLabel} {year}
              </strong>
              . Las fechas se crearán según el patrón:{" "}
              {selectedMeeting.recurrence_type === "WEEKLY" &&
                selectedMeeting.day_of_week &&
                `cada ${selectedMeeting.day_of_week.toLowerCase()}`}
              {selectedMeeting.recurrence_type === "BIWEEKLY" &&
                "cada quince días"}
              {selectedMeeting.recurrence_type === "MONTHLY" && "una vez al mes"}
              {selectedMeeting.recurrence_type === "CUSTOM" &&
                "manual (crea sesiones individuales)"}
              .
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || !recurringMeetingId || meetings.filter((m) => m.is_active).length === 0
            }
          >
            {isSubmitting ? "Generando..." : "Generar sesiones"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
