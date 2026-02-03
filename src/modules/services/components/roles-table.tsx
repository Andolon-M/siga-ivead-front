import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import type { RequiredRole } from "../types"

interface RolesTableProps {
  roles: RequiredRole[]
  onEdit?: (role: RequiredRole) => void
  onDelete?: (roleId: string) => void
  isLoading?: boolean
}

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

export function RolesTable({ roles, onEdit, onDelete, isLoading }: RolesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          <p>Cargando roles...</p>
        </div>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <div className="rounded-md border border-dashed">
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No hay roles definidos</p>
          <p className="text-xs mt-1">Agrega roles para definir qué se necesita en esta reunión</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rol</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Obligatorio</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                {ROLE_LABELS[role.role] ?? role.role}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{role.quantity}</Badge>
              </TableCell>
              <TableCell>
                {role.is_required ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs">Sí</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs">No</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {role.description || "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(role)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(role.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
