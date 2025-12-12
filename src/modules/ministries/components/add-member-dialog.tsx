import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
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
import type { AddMemberToMinistryRequest, MinistryRole } from "../types"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddMemberToMinistryRequest) => Promise<void>
  ministryName: string
}

export function AddMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  ministryName,
}: AddMemberDialogProps) {
  const [memberId, setMemberId] = useState<string | undefined>(undefined)
  const [role, setRole] = useState<MinistryRole>("MIEMBRO")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!memberId) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        memberId,
        role,
      })
      // Limpiar formulario
      setMemberId(undefined)
      setRole("MIEMBRO")
      onOpenChange(false)
    } catch (error) {
      console.error("Error al agregar miembro:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Miembro al Ministerio</DialogTitle>
          <DialogDescription>
            Agrega un miembro a <strong>{ministryName}</strong> y asigna su rol
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member">Miembro *</Label>
            <MemberSelector
              value={memberId}
              onValueChange={setMemberId}
              placeholder="Buscar y seleccionar miembro..."
            />
            <p className="text-xs text-muted-foreground">
              Busca por nombre, apellido o DNI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol en el Ministerio *</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as MinistryRole)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MIEMBRO">Miembro</SelectItem>
                <SelectItem value="EQUIPO">Equipo</SelectItem>
                <SelectItem value="LIDER">Líder</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "LIDER" &&
                "Al asignar un líder, el líder anterior será cambiado a EQUIPO"}
              {role === "EQUIPO" && "Miembros que forman parte del equipo"}
              {role === "MIEMBRO" && "Miembros regulares del ministerio"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !memberId}>
            {isSubmitting ? "Agregando..." : "Agregar Miembro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

