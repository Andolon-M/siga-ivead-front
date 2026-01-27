import { useState, useEffect, useRef } from "react"
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
import { formatDateForInput } from "@/shared/lib/date-utils"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onSubmit: (data: UpdateMemberData) => void
}

export function EditMemberDialog({ open, onOpenChange, member, onSubmit }: EditMemberDialogProps) {
  const [assignUser, setAssignUser] = useState(false)
  const [formData, setFormData] = useState<UpdateMemberData>({})
  const originalData = useRef<UpdateMemberData>({})

  useEffect(() => {
    if (member) {
      const initialData = {
        user_id: member.user_id,
        name: member.name,
        last_name: member.last_name,
        tipo_dni: member.tipo_dni,
        dni_user: member.dni_user,
        birthdate: formatDateForInput(member.birthdate),
        gender: member.gender,
        cell: member.cell,
        direccion: member.direccion,
        status: member.status,
      }
      setFormData(initialData)
      originalData.current = initialData
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

    // Solo enviar campos que han sido modificados
    const dataToSubmit: UpdateMemberData = {}
    
    // Comparar cada campo con el valor original
    const trimmedName = formData.name?.trim()
    if (trimmedName && trimmedName !== originalData.current.name?.trim()) {
      dataToSubmit.name = trimmedName
    }
    
    const trimmedLastName = formData.last_name?.trim()
    if (trimmedLastName !== originalData.current.last_name?.trim()) {
      dataToSubmit.last_name = trimmedLastName || ""
    }
    
    if (formData.tipo_dni !== originalData.current.tipo_dni) {
      dataToSubmit.tipo_dni = formData.tipo_dni
    }
    
    const trimmedDni = formData.dni_user?.trim()
    if (trimmedDni !== originalData.current.dni_user?.trim()) {
      dataToSubmit.dni_user = trimmedDni || ""
    }
    
    if (formData.birthdate !== originalData.current.birthdate) {
      dataToSubmit.birthdate = formData.birthdate || ""
    }
    
    if (formData.gender !== originalData.current.gender) {
      dataToSubmit.gender = formData.gender
    }
    
    const trimmedCell = formData.cell?.trim()
    if (trimmedCell !== originalData.current.cell?.trim()) {
      dataToSubmit.cell = trimmedCell || ""
    }
    
    const trimmedDireccion = formData.direccion?.trim()
    if (trimmedDireccion !== originalData.current.direccion?.trim()) {
      dataToSubmit.direccion = trimmedDireccion || ""
    }
    
    if (formData.status !== originalData.current.status) {
      dataToSubmit.status = formData.status
    }
    
    // Gestionar el campo user_id
    const currentUserId = assignUser ? formData.user_id : undefined
    if (currentUserId !== originalData.current.user_id) {
      dataToSubmit.user_id = currentUserId
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
                Apellido
              </Label>
              <Input
                id="edit-lastname"
                value={formData.last_name || ""}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dni-type">
                Tipo de DNI
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
                Número de DNI
              </Label>
              <Input
                id="edit-dni"
                value={formData.dni_user || ""}
                onChange={(e) => setFormData({ ...formData, dni_user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthdate">
                Fecha de Nacimiento
              </Label>
              <Input
                id="edit-birthdate"
                type="date"
                value={formData.birthdate || ""}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">
                Género
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
                Teléfono
              </Label>
              <Input
                id="edit-phone"
                value={formData.cell || ""}
                onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
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
                  <SelectItem value="VISITANTE">Visitante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-address">
                Dirección
              </Label>
              <Input
                id="edit-address"
                value={formData.direccion || ""}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Solo el nombre y el estado son obligatorios
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

