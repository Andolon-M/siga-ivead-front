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
        user_id: member.user_id,
        name: member.name,
        last_name: member.last_name,
        tipo_dni: member.tipo_dni,
        dni_user: member.dni_user,
        birthdate: member.birthdate,
        gender: member.gender,
        cell: member.cell,
        direccion: member.direccion,
        status: member.status,
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
            <Label htmlFor="edit-user-id">ID de Usuario</Label>
            <Input
              id="edit-user-id"
              value={formData.user_id || ""}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            />
          </div>
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
              value={formData.last_name || ""}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dni-type">Tipo de DNI</Label>
            <Select
              value={formData.tipo_dni || member.tipo_dni}
              onValueChange={(value) => setFormData({ ...formData, tipo_dni: value as DocumentType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">CC - Cédula de Ciudadanía</SelectItem>
                <SelectItem value="TI">TI - Tarjeta de Identidad</SelectItem>
                <SelectItem value="RC">RC - Registro Civil</SelectItem>
                <SelectItem value="PP">PP - Pasaporte</SelectItem>
                <SelectItem value="CE">CE - Cédula de Extranjería</SelectItem>
                <SelectItem value="PEP">PEP - Permiso Especial</SelectItem>
                <SelectItem value="DNI">DNI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dni">Número de DNI</Label>
            <Input
              id="edit-dni"
              value={formData.dni_user || ""}
              onChange={(e) => setFormData({ ...formData, dni_user: e.target.value })}
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
              value={formData.cell || ""}
              onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
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
              value={formData.direccion || ""}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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

