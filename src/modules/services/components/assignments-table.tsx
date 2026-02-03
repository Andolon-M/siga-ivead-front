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
import { CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ServiceAssignment } from "../types"

interface AssignmentsTableProps {
  assignments: ServiceAssignment[]
  onConfirm?: (assignmentId: string) => void
  onCancel?: (assignmentId: string) => void
  onDelete?: (assignmentId: string) => void
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

const STATUS_CONFIG = {
  PENDIENTE: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
  CONFIRMADO: { label: "Confirmado", variant: "default" as const, icon: CheckCircle2 },
  CANCELADO: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
  COMPLETADO: { label: "Completado", variant: "outline" as const, icon: CheckCircle2 },
}

export function AssignmentsTable({
  assignments,
  onConfirm,
  onCancel,
  onDelete,
  isLoading,
}: AssignmentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          <p>Cargando asignaciones...</p>
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-md border border-dashed">
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No hay asignaciones</p>
          <p className="text-xs mt-1">Asigna miembros a los roles de servicio</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Miembro</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Confirmado</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const statusConfig = STATUS_CONFIG[assignment.status]
            const StatusIcon = statusConfig.icon
            const member = assignment.member
            const role = assignment.required_role

            return (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {member ? `${member.name} ${member.last_name ?? ""}` : "Sin asignar"}
                </TableCell>
                <TableCell>
                  {role ? ROLE_LABELS[role.role] ?? role.role : "Sin rol"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {assignment.confirmed_at
                    ? format(new Date(assignment.confirmed_at), "d MMM, HH:mm", { locale: es })
                    : "-"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {assignment.notes || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {assignment.status === "PENDIENTE" && onConfirm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onConfirm(assignment.id)}
                        title="Confirmar"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                    {assignment.status === "CONFIRMADO" && onCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(assignment.id)}
                        title="Cancelar"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(assignment.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
