import { useEffect, useMemo, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import type { UpdateVolunteerActivityData, VolunteerActivity } from "../types"

interface EditActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: VolunteerActivity | null
  onSubmit: (data: UpdateVolunteerActivityData) => Promise<void> | void
}

function parseIsoDateTime(iso: string) {
  const date = new Date(iso)
  const dateValue = date.toISOString().slice(0, 10)
  const timeValue = date.toISOString().slice(11, 16)
  return { dateValue, timeValue }
}

function toIsoString(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function EditActivityDialog({ open, onOpenChange, activity, onSubmit }: EditActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState("")
  const [start, setStart] = useState("00:00")
  const [end, setEnd] = useState("01:00")
  const [formData, setFormData] = useState<UpdateVolunteerActivityData>({
    name: "",
    description: "",
    slot_duration_minutes: 60,
    location: "",
    generate_slots: true,
  })

  useEffect(() => {
    if (!activity) return
    const startInfo = parseIsoDateTime(activity.start_time)
    const endInfo = parseIsoDateTime(activity.end_time)
    setDate(activity.activity_date?.slice(0, 10) || startInfo.dateValue)
    setStart(startInfo.timeValue)
    setEnd(endInfo.timeValue)
    setFormData({
      name: activity.name,
      description: activity.description || "",
      slot_duration_minutes: activity.slot_duration_minutes,
      location: activity.location || "",
      generate_slots: activity.generate_slots ?? true,
    })
  }, [activity])

  const canSubmit = useMemo(() => !!activity && !!formData.name?.trim() && !!date, [activity, date, formData.name])

  const handleSubmit = async () => {
    if (!activity) return
    const startIso = toIsoString(date, start)
    const endIso = toIsoString(date, end)
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      alert("La hora de finalización debe ser mayor a la hora de inicio")
      return
    }
    const diffMinutes = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000 / 60
    const slotDuration = formData.slot_duration_minutes || 60
    if (diffMinutes % slotDuration !== 0) {
      alert("El rango horario debe dividir exactamente por la duración de slot")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        name: formData.name?.trim(),
        description: formData.description?.trim() || undefined,
        activity_date: date,
        start_time: startIso,
        end_time: endIso,
        location: formData.location?.trim() || undefined,
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
          <DialogTitle>Editar actividad</DialogTitle>
          <DialogDescription>Actualiza configuración de fecha, rango horario y slots.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-name-edit">Nombre</Label>
            <Input
              id="activity-name-edit"
              value={formData.name || ""}
              onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-description-edit">Descripción</Label>
            <Textarea
              id="activity-description-edit"
              value={formData.description || ""}
              onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="activity-date-edit">Fecha</Label>
              <Input id="activity-date-edit" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-start-edit">Inicio</Label>
              <Input id="activity-start-edit" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-end-edit">Fin</Label>
              <Input id="activity-end-edit" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="slot-duration-edit">Duración slot (min)</Label>
              <Input
                id="slot-duration-edit"
                type="number"
                min={15}
                step={5}
                value={formData.slot_duration_minutes ?? 60}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, slot_duration_minutes: Number(e.target.value || 60) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-location-edit">Ubicación</Label>
              <Input
                id="activity-location-edit"
                value={formData.location || ""}
                onChange={(e) => setFormData((current) => ({ ...current, location: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Generar slots automáticamente</p>
              <p className="text-xs text-muted-foreground">Conserva esta opción para recalcular slots en backend.</p>
            </div>
            <Switch
              checked={formData.generate_slots ?? true}
              onCheckedChange={(value) => setFormData((current) => ({ ...current, generate_slots: value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
