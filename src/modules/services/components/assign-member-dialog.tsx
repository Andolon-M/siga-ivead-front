import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
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
import { MemberSelector } from "./member-selector"
import type { CreateAssignmentRequest, RequiredRole, AssignmentStatus } from "../types"

interface AssignMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: RequiredRole[]
  onSubmit: (data: CreateAssignmentRequest) => Promise<void>
}

const ASSIGNMENT_STATUSES: { value: AssignmentStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADO", label: "Confirmado" },
]

const ROLE_LABELS: Record<string, string> = {
  DIACONADO: "Diácono/Ujier",
  UJIER: "Diácono/Ujier",
  DIRECTOR_CULTO: "Director de Culto",
  LIDER_ORACION: "Líder de Oración",
  MULTIMEDIA: "Multimedia",
  MUSICA: "Música",
  SONIDO: "Sonido",
  NINOS: "Niños",
  OTRO: "Otro",
}

export function AssignMemberDialog({
  open,
  onOpenChange,
  roles,
  onSubmit,
}: AssignMemberDialogProps) {
  const [formData, setFormData] = useState<CreateAssignmentRequest>({
    required_role_id: "",
    member_id: "",
    status: "PENDIENTE",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && roles.length > 0 && !formData.required_role_id) {
      setFormData((prev) => ({ ...prev, required_role_id: roles[0].id }))
    }
  }, [open, roles, formData.required_role_id])

  const handleSubmit = async () => {
    if (!formData.required_role_id || !formData.member_id) return

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      setFormData({
        required_role_id: roles[0]?.id ?? "",
        member_id: "",
        status: "PENDIENTE",
        notes: "",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al asignar miembro:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Miembro</DialogTitle>
          <DialogDescription>
            Asigna un miembro a un rol de servicio para esta sesión
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Rol *</Label>
            <Select
              value={formData.required_role_id}
              onValueChange={(value) =>
                setFormData({ ...formData, required_role_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {ROLE_LABELS[role.role] ?? role.role} ({role.quantity} necesario
                    {role.quantity > 1 ? "s" : ""})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {roles.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay roles definidos. Primero define los roles requeridos.
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Miembro *</Label>
            <MemberSelector
              value={formData.member_id}
              onValueChange={(value) => setFormData({ ...formData, member_id: value ?? "" })}
              placeholder="Buscar miembro activo..."
            />
            <p className="text-xs text-muted-foreground">
              Busca por nombre, DNI o teléfono
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select
              value={formData.status ?? "PENDIENTE"}
              onValueChange={(value: AssignmentStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales..."
              rows={2}
              value={formData.notes ?? ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.required_role_id ||
              !formData.member_id ||
              roles.length === 0
            }
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
