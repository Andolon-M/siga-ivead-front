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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { DollarSign } from "lucide-react"
import type { CreateEventData } from "../types"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateEventData) => void
}

export function CreateEventDialog({ open, onOpenChange, onSubmit }: CreateEventDialogProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: 0,
    ministry: "",
    hasPrice: false,
    price: undefined,
  })

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      capacity: 0,
      ministry: "",
      hasPrice: false,
      price: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo evento</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="title">Título del Evento</Label>
            <Input
              id="title"
              placeholder="Ej: Servicio Dominical"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el evento..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              placeholder="Ej: Templo Principal"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="100"
              value={formData.capacity || ""}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ministry">Ministerio</Label>
            <Select
              value={formData.ministry}
              onValueChange={(value) => setFormData({ ...formData, ministry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alabanza">Ministerio de Alabanza</SelectItem>
                <SelectItem value="juvenil">Ministerio Juvenil</SelectItem>
                <SelectItem value="ninos">Ministerio de Niños</SelectItem>
                <SelectItem value="familiar">Ministerio Familiar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="has-price">¿Tiene costo?</Label>
            <Select
              value={formData.hasPrice ? "yes" : "no"}
              onValueChange={(value) => setFormData({ ...formData, hasPrice: value === "yes" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Sí</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.hasPrice && (
            <div className="space-y-2">
              <Label htmlFor="price">Precio (opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="pl-10"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Crear Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

