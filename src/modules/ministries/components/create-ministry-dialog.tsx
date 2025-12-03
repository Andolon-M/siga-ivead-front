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
import type { CreateMinistryData } from "../types"

interface CreateMinistryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMinistryData) => void
}

export function CreateMinistryDialog({ open, onOpenChange, onSubmit }: CreateMinistryDialogProps) {
  const [formData, setFormData] = useState<CreateMinistryData>({
    name: "",
    description: "",
    leader: "",
  })

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      name: "",
      description: "",
      leader: "",
    })
    onOpenChange(false)
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
            <Label htmlFor="name">Nombre del Ministerio</Label>
            <Input
              id="name"
              placeholder="Ej: Ministerio de Alabanza"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Crear Ministerio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

