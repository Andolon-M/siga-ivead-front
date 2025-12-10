import { useState } from "react"
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
import type { CreateMemberData, DocumentType, Gender, MemberStatus } from "../types"

interface CreateMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMemberData) => void
}

export function CreateMemberDialog({ open, onOpenChange, onSubmit }: CreateMemberDialogProps) {
  const [formData, setFormData] = useState<CreateMemberData>({
    user_id: "",
    name: "",
    last_name: "",
    tipo_dni: "CC",
    dni_user: "",
    birthdate: "",
    gender: "MASCULINO",
    cell: "",
    direccion: "",
    status: "ASISTENTE",
  })

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      user_id: "",
      name: "",
      last_name: "",
      tipo_dni: "CC",
      dni_user: "",
      birthdate: "",
      gender: "MASCULINO",
      cell: "",
      direccion: "",
      status: "ASISTENTE",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Miembro</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo miembro</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">ID de Usuario</Label>
            <Input
              id="user_id"
              placeholder="ID del usuario"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Apellido</Label>
            <Input
              id="lastname"
              placeholder="Apellido"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni-type">Tipo de DNI</Label>
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
            <Label htmlFor="dni">Número de DNI</Label>
            <Input
              id="dni"
              placeholder="1234567890"
              value={formData.dni_user}
              onChange={(e) => setFormData({ ...formData, dni_user: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
            <Input
              id="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
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
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="3001234567"
              value={formData.cell}
              onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
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
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Calle 123 #45-67"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>
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

