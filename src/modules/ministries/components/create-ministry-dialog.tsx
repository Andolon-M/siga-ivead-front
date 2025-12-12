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
import type { CreateMinistryRequest } from "../types"

interface CreateMinistryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMinistryRequest) => Promise<void>
}

export function CreateMinistryDialog({ open, onOpenChange, onSubmit }: CreateMinistryDialogProps) {
  const [formData, setFormData] = useState<CreateMinistryRequest>({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      setFormData({
        name: "",
        description: "",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear ministerio:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Ministerio</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo ministerio</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Ministerio *</Label>
            <Input
              id="name"
              placeholder="Ej: Ministerio de Alabanza"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el propósito del ministerio..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? "Creando..." : "Crear Ministerio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

