import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import type { Member, UpdateMemberData, DocumentType, Gender, MemberStatus } from "../types"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onSubmit: (data: UpdateMemberData) => void
}

export function EditMemberDialog({ open, onOpenChange, member, onSubmit }: EditMemberDialogProps) {
  const [formData, setFormData] = useState<UpdateMemberData>({})

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        lastName: member.lastName,
        documentType: member.documentType || "CC",
        dni: member.dni,
        birthdate: member.birthdate,
        gender: member.gender,
        phone: member.phone,
        status: member.status,
        address: member.address,
      })
    }
  }, [member])

  const handleSubmit = () => {
    if (member) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Miembro</DialogTitle>
          <DialogDescription>Modifica los datos del miembro</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-lastname">Apellido</Label>
            <Input
              id="edit-lastname"
              value={formData.lastName || ""}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dni-type">Tipo de DNI</Label>
            <Select
              value={formData.documentType || member.documentType || "CC"}
              onValueChange={(value) => setFormData({ ...formData, documentType: value as DocumentType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">CC</SelectItem>
                <SelectItem value="TI">TI</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="PP">PP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dni">Número de DNI</Label>
            <Input
              id="edit-dni"
              value={formData.dni || ""}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-birthdate">Fecha de Nacimiento</Label>
            <Input
              id="edit-birthdate"
              type="date"
              value={formData.birthdate || ""}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-gender">Género</Label>
            <Select
              value={formData.gender || member.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMENINO">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input
              id="edit-phone"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Estado</Label>
            <Select
              value={formData.status || member.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as MemberStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASISTENTE">Asistente</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-address">Dirección</Label>
            <Input
              id="edit-address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

