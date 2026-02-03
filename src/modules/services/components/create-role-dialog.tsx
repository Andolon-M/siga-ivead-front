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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import type { CreateRequiredRoleRequest, ServiceRole } from "../types"

const SERVICE_ROLES: { value: ServiceRole; label: string; description: string }[] = [
  { value: "DIACONADO", label: "Diácono/Ujier", description: "Recepción de visitantes" },
  { value: "DIRECTOR_CULTO", label: "Director de Culto", description: "Dirige la reunión" },
  { value: "LIDER_ORACION", label: "Líder de Oración", description: "Guía el tiempo de oración" },
  { value: "MULTIMEDIA", label: "Multimedia", description: "Proyección y grabación" },
  { value: "MUSICA", label: "Música", description: "Equipo de alabanza" },
  { value: "SONIDO", label: "Sonido", description: "Operador de sonido" },
  { value: "NINOS", label: "Niños", description: "Cuidado de niños" },
  { value: "OTRO", label: "Otro", description: "Otros roles personalizados" },
]

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateRequiredRoleRequest) => Promise<void>
}

export function CreateRoleDialog({ open, onOpenChange, onSubmit }: CreateRoleDialogProps) {
  const [formData, setFormData] = useState<CreateRequiredRoleRequest>({
    role: "DIACONADO",
    quantity: 1,
    is_required: true,
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      setFormData({
        role: "DIACONADO",
        quantity: 1,
        is_required: true,
        description: "",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear rol:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRole = SERVICE_ROLES.find((r) => r.value === formData.role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Rol Requerido</DialogTitle>
          <DialogDescription>
            Define qué roles de servicio se necesitan para esta reunión
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tipo de rol *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: ServiceRole) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-muted-foreground">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad necesaria *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={20}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Número de personas necesarias para este rol
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder={selectedRole?.description ?? "Describe las responsabilidades..."}
              rows={2}
              value={formData.description ?? ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_required"
              checked={formData.is_required ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
            />
            <Label htmlFor="is_required" className="cursor-pointer">
              Rol obligatorio
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Agregando..." : "Agregar Rol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
