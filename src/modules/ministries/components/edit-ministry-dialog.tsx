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
import type { Ministry, UpdateMinistryData } from "../types"

interface EditMinistryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ministry: Ministry | null
  onSubmit: (data: UpdateMinistryData) => void
}

export function EditMinistryDialog({ open, onOpenChange, ministry, onSubmit }: EditMinistryDialogProps) {
  const [formData, setFormData] = useState<UpdateMinistryData>({})

  useEffect(() => {
    if (ministry) {
      setFormData({
        name: ministry.name,
        description: ministry.description,
        leader: ministry.leader,
        members: ministry.members,
      })
    }
  }, [ministry])

  const handleSubmit = () => {
    if (ministry) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  if (!ministry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ministerio</DialogTitle>
          <DialogDescription>Modifica los datos del ministerio</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del Ministerio</Label>
            <Input
              id="edit-name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-leader">Líder</Label>
            <Input
              id="edit-leader"
              value={formData.leader || ""}
              onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
            />
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

