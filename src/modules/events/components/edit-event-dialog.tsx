import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import type { Event, UpdateEventData, EventStatus } from "../types"

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  onSubmit: (data: UpdateEventData) => void
}

export function EditEventDialog({ open, onOpenChange, event, onSubmit }: EditEventDialogProps) {
  const [formData, setFormData] = useState<UpdateEventData>({})

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        ministry: event.ministry,
        responsible: event.responsible,
        price: event.price,
        status: event.status,
      })
    }
  }, [event])

  const handleSubmit = () => {
    if (event) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>Actualiza la información general del evento</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-title">Título del Evento</Label>
            <Input
              id="edit-title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-ministry">Ministerio</Label>
            <Input
              id="edit-ministry"
              value={formData.ministry || ""}
              onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-responsible">Responsable</Label>
            <Input
              id="edit-responsible"
              value={formData.responsible || ""}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            />
          </div>
          {event.hasPrice && (
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || undefined })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-status">Estado</Label>
            <Select
              value={formData.status || event.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as EventStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANIFICADO">Planificado</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

