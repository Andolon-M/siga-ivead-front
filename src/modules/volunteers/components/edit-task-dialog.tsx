import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import type { DayOfWeek, RecurrenceType, UpdateVolunteerTaskData, VolunteerTask } from "../types"

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: VolunteerTask | null
  onSubmit: (data: UpdateVolunteerTaskData) => Promise<void> | void
}

const recurrenceNeedsDay: RecurrenceType[] = ["WEEKLY", "BIWEEKLY"]

const LOCATION_AUDITORIO = "Auditorio IVE"
const LOCATION_SELECT_AUDITORIO = "AUDITORIO_IVE"
const LOCATION_SELECT_OTRA = "OTRA"

export function EditTaskDialog({ open, onOpenChange, task, onSubmit }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationSelect, setLocationSelect] = useState(LOCATION_SELECT_AUDITORIO)
  const [locationOther, setLocationOther] = useState("")
  const [formData, setFormData] = useState<UpdateVolunteerTaskData>({})

  useEffect(() => {
    if (!task) return
    const loc = task.location?.trim() || ""
    const isAuditorio = !loc || loc === LOCATION_AUDITORIO
    setLocationSelect(isAuditorio ? LOCATION_SELECT_AUDITORIO : LOCATION_SELECT_OTRA)
    setLocationOther(isAuditorio ? "" : loc)
    setFormData({
      name: task.name,
      description: task.description || "",
      recurrence_type: task.recurrence_type,
      day_of_week: task.day_of_week || undefined,
      default_quantity: task.default_quantity,
      location: task.location || "",
      is_active: task.is_active,
    })
  }, [task])

  const recurrenceType = (formData.recurrence_type || task?.recurrence_type || "WEEKLY") as RecurrenceType
  const needsDayOfWeek = recurrenceNeedsDay.includes(recurrenceType)
  const showOtherLocation = locationSelect === LOCATION_SELECT_OTRA

  const handleSubmit = async () => {
    if (!task) return
    if (!formData.name?.trim()) {
      alert("El nombre de la tarea es obligatorio")
      return
    }
    if (needsDayOfWeek && !formData.day_of_week) {
      alert("Debes seleccionar día de la semana para esta recurrencia")
      return
    }
    if (showOtherLocation && !locationOther.trim()) {
      alert("Indica la otra ubicación.")
      return
    }

    const locationValue = locationSelect === LOCATION_SELECT_AUDITORIO ? LOCATION_AUDITORIO : locationOther.trim()

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        name: formData.name?.trim(),
        description: formData.description?.trim() || undefined,
        location: locationValue || undefined,
        day_of_week: needsDayOfWeek ? formData.day_of_week : undefined,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarea</DialogTitle>
          <DialogDescription>Actualiza los datos de la tarea recurrente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name-edit">Nombre</Label>
            <Input
              id="task-name-edit"
              value={formData.name || ""}
              onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description-edit">Descripción</Label>
            <Textarea
              id="task-description-edit"
              value={formData.description || ""}
              onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Recurrencia</Label>
              <Select
                value={recurrenceType}
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
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="BIWEEKLY">Quincenal</SelectItem>
                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                  <SelectItem value="CUSTOM">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Día de semana</Label>
              <Select
                value={formData.day_of_week || ""}
                onValueChange={(value) => setFormData((current) => ({ ...current, day_of_week: value as DayOfWeek }))}
                disabled={!needsDayOfWeek}
              >
                <SelectTrigger>
                  <SelectValue placeholder={needsDayOfWeek ? "Selecciona un día" : "No aplica"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LUNES">Lunes</SelectItem>
                  <SelectItem value="MARTES">Martes</SelectItem>
                  <SelectItem value="MIERCOLES">Miércoles</SelectItem>
                  <SelectItem value="JUEVES">Jueves</SelectItem>
                  <SelectItem value="VIERNES">Viernes</SelectItem>
                  <SelectItem value="SABADO">Sábado</SelectItem>
                  <SelectItem value="DOMINGO">Domingo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-capacity-edit">Cupos por ocurrencia</Label>
              <Input
                id="task-capacity-edit"
                type="number"
                min={1}
                value={formData.default_quantity ?? 1}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, default_quantity: Number(e.target.value || 1) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-location-edit">Ubicación</Label>
              <Select
                value={locationSelect}
                onValueChange={(v) => {
                  setLocationSelect(v)
                  if (v !== LOCATION_SELECT_OTRA) setLocationOther("")
                }}
              >
                <SelectTrigger id="task-location-edit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_SELECT_AUDITORIO}>{LOCATION_AUDITORIO}</SelectItem>
                  <SelectItem value={LOCATION_SELECT_OTRA}>Otra</SelectItem>
                </SelectContent>
              </Select>
              {showOtherLocation ? (
                <Input
                  value={locationOther}
                  onChange={(e) => setLocationOther(e.target.value)}
                  placeholder="Escribe la ubicación"
                  className="mt-2"
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Tarea activa</p>
              <p className="text-xs text-muted-foreground">Define si queda habilitada para nuevas asignaciones.</p>
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
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
