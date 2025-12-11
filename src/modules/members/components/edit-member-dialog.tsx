import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { UserSelector } from "./user-selector"
import type { Member, UpdateMemberData, DocumentType, Gender, MemberStatus } from "../types"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onSubmit: (data: UpdateMemberData) => void
}

export function EditMemberDialog({ open, onOpenChange, member, onSubmit }: EditMemberDialogProps) {
  const [assignUser, setAssignUser] = useState(false)
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
      setAssignUser(!!member.user_id)
    }
  }, [member])

  const handleSubmit = () => {
    if (!member) return

    // Validar campos obligatorios
    if (!formData.name?.trim()) {
      alert("El nombre es obligatorio")
      return
    }
    if (!formData.last_name?.trim()) {
      alert("El apellido es obligatorio")
      return
    }
    if (!formData.dni_user?.trim()) {
      alert("El número de DNI es obligatorio")
      return
    }
    if (!formData.birthdate) {
      alert("La fecha de nacimiento es obligatoria")
      return
    }
    if (!formData.cell?.trim()) {
      alert("El teléfono es obligatorio")
      return
    }
    if (!formData.direccion?.trim()) {
      alert("La dirección es obligatoria")
      return
    }

    // Si no se asignó usuario, enviar sin user_id
    const dataToSubmit: UpdateMemberData = {
      ...formData,
      user_id: assignUser ? formData.user_id : undefined,
    }
    
    onSubmit(dataToSubmit)
    onOpenChange(false)
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Miembro</DialogTitle>
          <DialogDescription>Modifica los datos del miembro</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Asignación de Usuario (Opcional) */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="edit-assign-user" className="text-base">
                Asignar Usuario
              </Label>
              <p className="text-sm text-muted-foreground">
                Vincular este miembro con una cuenta de usuario (opcional)
              </p>
            </div>
            <Switch
              id="edit-assign-user"
              checked={assignUser}
              onCheckedChange={setAssignUser}
            />
          </div>

          {/* Selector de Usuario */}
          {assignUser && (
            <div className="space-y-2">
              <Label>Usuario</Label>
              <UserSelector
                value={formData.user_id}
                onValueChange={(userId) => setFormData({ ...formData, user_id: userId })}
                placeholder="Seleccionar usuario..."
              />
              <p className="text-xs text-muted-foreground">
                Busca por email o nombre del usuario
              </p>
            </div>
          )}

          {/* Campos del formulario */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastname">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-lastname"
                value={formData.last_name || ""}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dni-type">
                Tipo de DNI <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="edit-dni">
                Número de DNI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-dni"
                value={formData.dni_user || ""}
                onChange={(e) => setFormData({ ...formData, dni_user: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthdate">
                Fecha de Nacimiento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-birthdate"
                type="date"
                value={formData.birthdate || ""}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">
                Género <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="edit-phone">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phone"
                value={formData.cell || ""}
                onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">
                Estado <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="edit-address">
                Dirección <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-address"
                value={formData.direccion || ""}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Los campos marcados con <span className="text-destructive">*</span> son obligatorios
          </p>
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

