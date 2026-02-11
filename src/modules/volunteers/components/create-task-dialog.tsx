import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import type { CreateVolunteerTaskData, DayOfWeek, RecurrenceType } from "../types"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateVolunteerTaskData) => Promise<void> | void
}

const recurrenceNeedsDay: RecurrenceType[] = ["WEEKLY", "BIWEEKLY"]

export function CreateTaskDialog({ open, onOpenChange, onSubmit }: CreateTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateVolunteerTaskData>({
    name: "",
    description: "",
    recurrence_type: "WEEKLY",
    day_of_week: "SABADO",
    default_quantity: 1,
    location: "",
    is_active: true,
  })

  const needsDayOfWeek = recurrenceNeedsDay.includes(formData.recurrence_type)

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("El nombre de la tarea es obligatorio")
      return
    }
    if (needsDayOfWeek && !formData.day_of_week) {
      alert("Debes seleccionar día de la semana para esta recurrencia")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        day_of_week: needsDayOfWeek ? formData.day_of_week : undefined,
      })
      onOpenChange(false)
      setFormData({
        name: "",
        description: "",
        recurrence_type: "WEEKLY",
        day_of_week: "SABADO",
        default_quantity: 1,
        location: "",
        is_active: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarea de voluntariado</DialogTitle>
          <DialogDescription>Define tarea, recurrencia y cupos por ocurrencia.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Nombre</Label>
            <Input
              id="task-name"
              value={formData.name}
              onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
              placeholder="Aseo del templo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
              placeholder="Descripción corta de la tarea"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Recurrencia</Label>
              <Select
                value={formData.recurrence_type}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    recurrence_type: value as RecurrenceType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">WEEKLY</SelectItem>
                  <SelectItem value="BIWEEKLY">BIWEEKLY</SelectItem>
                  <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Día de semana</Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) => setFormData((current) => ({ ...current, day_of_week: value as DayOfWeek }))}
                disabled={!needsDayOfWeek}
              >
                <SelectTrigger>
                  <SelectValue placeholder={needsDayOfWeek ? "Selecciona un día" : "No aplica"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LUNES">LUNES</SelectItem>
                  <SelectItem value="MARTES">MARTES</SelectItem>
                  <SelectItem value="MIERCOLES">MIERCOLES</SelectItem>
                  <SelectItem value="JUEVES">JUEVES</SelectItem>
                  <SelectItem value="VIERNES">VIERNES</SelectItem>
                  <SelectItem value="SABADO">SABADO</SelectItem>
                  <SelectItem value="DOMINGO">DOMINGO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-capacity">Cupos por ocurrencia</Label>
              <Input
                id="task-capacity"
                type="number"
                min={1}
                value={formData.default_quantity}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, default_quantity: Number(e.target.value || 1) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-location">Ubicación</Label>
              <Input
                id="task-location"
                value={formData.location}
                onChange={(e) => setFormData((current) => ({ ...current, location: e.target.value }))}
                placeholder="Templo principal"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Tarea activa</p>
              <p className="text-xs text-muted-foreground">Las tareas inactivas no deberían aceptar nuevas asignaciones.</p>
            </div>
            <Switch
              checked={!!formData.is_active}
              onCheckedChange={(value) => setFormData((current) => ({ ...current, is_active: value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Crear tarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
