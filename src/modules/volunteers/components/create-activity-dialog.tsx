import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import type { CreateVolunteerActivityData } from "../types"

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateVolunteerActivityData) => Promise<void> | void
}

function toIsoString(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function CreateActivityDialog({ open, onOpenChange, onSubmit }: CreateActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState("")
  const [start, setStart] = useState("00:00")
  const [end, setEnd] = useState("01:00")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slot_duration_minutes: 60,
    location: "",
    generate_slots: true,
  })

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("El nombre de la actividad es obligatorio")
      return
    }
    if (!date) {
      alert("Debes seleccionar fecha")
      return
    }
    const startIso = toIsoString(date, start)
    const endIso = toIsoString(date, end)
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      alert("La hora de finalización debe ser mayor a la hora de inicio")
      return
    }
    const diffMinutes = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000 / 60
    if (diffMinutes % formData.slot_duration_minutes !== 0) {
      alert("El rango horario debe dividir exactamente por la duración de slot")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        activity_date: date,
        start_time: startIso,
        end_time: endIso,
        slot_duration_minutes: formData.slot_duration_minutes,
        location: formData.location.trim() || undefined,
        generate_slots: formData.generate_slots,
      })
      onOpenChange(false)
      setDate("")
      setStart("00:00")
      setEnd("01:00")
      setFormData({
        name: "",
        description: "",
        slot_duration_minutes: 60,
        location: "",
        generate_slots: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva actividad por slots</DialogTitle>
          <DialogDescription>Configura el rango horario y generación de slots.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-name">Nombre</Label>
            <Input
              id="activity-name"
              value={formData.name}
              onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
              placeholder="Maratónica de oración"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-description">Descripción</Label>
            <Textarea
              id="activity-description"
              value={formData.description}
              onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="activity-date">Fecha</Label>
              <Input id="activity-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-start">Inicio</Label>
              <Input id="activity-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-end">Fin</Label>
              <Input id="activity-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="slot-duration">Duración slot (min)</Label>
              <Input
                id="slot-duration"
                type="number"
                min={15}
                step={5}
                value={formData.slot_duration_minutes}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, slot_duration_minutes: Number(e.target.value || 60) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-location">Ubicación</Label>
              <Input
                id="activity-location"
                value={formData.location}
                onChange={(e) => setFormData((current) => ({ ...current, location: e.target.value }))}
                placeholder="Templo principal"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Generar slots automáticamente</p>
              <p className="text-xs text-muted-foreground">Si se desactiva, deberás gestionarlos manualmente en backend.</p>
            </div>
            <Switch
              checked={formData.generate_slots}
              onCheckedChange={(value) => setFormData((current) => ({ ...current, generate_slots: value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Crear actividad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
