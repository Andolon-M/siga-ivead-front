import { useState } from "react"
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
import type { CreateMemberData, DocumentType, Gender, MemberStatus } from "../types"

interface CreateMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMemberData) => void
}

export function CreateMemberDialog({ open, onOpenChange, onSubmit }: CreateMemberDialogProps) {
  const [assignUser, setAssignUser] = useState(false)
  const [formData, setFormData] = useState<CreateMemberData>({
    user_id: undefined,
    name: "",
    last_name: "",
    tipo_dni: "CC",
    dni_user: "",
    birthdate: "",
    gender: "MASCULINO",
    cell: "",
    direccion: "",
    status: "VISITANTE",
  })

  const handleSubmit = () => {
    // Validar campos obligatorios
    if (!formData.name?.trim()) {
      alert("El nombre es obligatorio")
      return
    }

    // Si no se asignó usuario, enviar sin user_id
    const dataToSubmit: CreateMemberData = {
      ...formData,
      user_id: assignUser ? formData.user_id : undefined,
    }
    onSubmit(dataToSubmit)
    
    // Resetear formulario
    setFormData({
      user_id: undefined,
      name: "",
      last_name: "",
      tipo_dni: "CC",
      dni_user: "",
      birthdate: "",
      gender: "MASCULINO",
      cell: "",
      direccion: "",
      status: "VISITANTE",
    })
    setAssignUser(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Miembro</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo miembro</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Asignación de Usuario (Opcional) */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="assign-user" className="text-base">
                Asignar Usuario
              </Label>
              <p className="text-sm text-muted-foreground">
                Vincular este miembro con una cuenta de usuario (opcional)
              </p>
            </div>
            <Switch
              id="assign-user"
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
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">
                Apellido
              </Label>
              <Input
                id="lastname"
                placeholder="Apellido"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni-type">
                Tipo de DNI
              </Label>
              <Select
                value={formData.tipo_dni}
                onValueChange={(value) => setFormData({ ...formData, tipo_dni: value as DocumentType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
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
              <Label htmlFor="dni">
                Número de DNI
              </Label>
              <Input
                id="dni"
                placeholder="1234567890"
                value={formData.dni_user}
                onChange={(e) => setFormData({ ...formData, dni_user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">
                Fecha de Nacimiento
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">
                Género
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="3001234567"
                value={formData.cell}
                onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                Estado <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as MemberStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
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
              <Label htmlFor="address">
                Dirección
              </Label>
              <Input
                id="address"
                placeholder="Calle 123 #45-67"
                value={formData.direccion}
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
          <Button onClick={handleSubmit}>Crear Miembro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

