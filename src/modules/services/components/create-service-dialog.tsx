import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
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
import { Switch } from "@/shared/components/ui/switch"
import type { CreateRecurringMeetingRequest, RecurrenceType, DayOfWeek } from "../types"

const RECURRENCE_TYPES: { value: RecurrenceType; label: string }[] = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "CUSTOM", label: "Personalizado" },
]

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "DOMINGO", label: "Domingo" },
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIERCOLES", label: "Miércoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
  { value: "SABADO", label: "Sábado" },
]

interface CreateServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateRecurringMeetingRequest) => Promise<void>
}

export function CreateServiceDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateServiceDialogProps) {
  const [formData, setFormData] = useState<CreateRecurringMeetingRequest>({
    name: "",
    description: "",
    recurrence_type: "WEEKLY",
    day_of_week: "DOMINGO",
    start_time: "10:00",
    duration_minutes: 120,
    location: "",
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsDayOfWeek = formData.recurrence_type === "WEEKLY" || formData.recurrence_type === "BIWEEKLY"

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.location.trim()) return
    if (needsDayOfWeek && !formData.day_of_week) return

    try {
      setIsSubmitting(true)
      const payload: CreateRecurringMeetingRequest = {
        ...formData,
        day_of_week: needsDayOfWeek ? formData.day_of_week : undefined,
      }
      await onSubmit(payload)
      setFormData({
        name: "",
        description: "",
        recurrence_type: "WEEKLY",
        day_of_week: "DOMINGO",
        start_time: "10:00",
        duration_minutes: 120,
        location: "",
        is_active: true,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear servicio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Servicio</DialogTitle>
          <DialogDescription>
            Crea un nuevo servicio recurrente (culto, reunión, etc.)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej: Culto Dominical"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el servicio..."
              rows={2}
              value={formData.description ?? ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo de recurrencia</Label>
              <Select
                value={formData.recurrence_type}
                onValueChange={(value: RecurrenceType) =>
                  setFormData({ ...formData, recurrence_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {needsDayOfWeek && (
              <div className="grid gap-2">
                <Label>Día de la semana</Label>
                <Select
                  value={formData.day_of_week ?? "DOMINGO"}
                  onValueChange={(value: DayOfWeek) =>
                    setFormData({ ...formData, day_of_week: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_time">Hora de inicio *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration_minutes">Duración (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min={15}
                max={480}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value) || 120,
                  })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              placeholder="Ej: Templo Principal"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active ?? true}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">Servicio activo</Label>
          </div>
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
              isSubmitting ||
              !formData.name.trim() ||
              !formData.location.trim() ||
              (needsDayOfWeek && !formData.day_of_week)
            }
          >
            {isSubmitting ? "Creando..." : "Crear Servicio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
