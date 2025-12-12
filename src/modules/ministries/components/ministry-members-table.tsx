import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Crown, UserCog, User as UserIcon, Trash2 } from "lucide-react"
import type { MinistryMember, MinistryRole } from "../types"

interface MinistryMembersTableProps {
  members: MinistryMember[]
  isLoading?: boolean
  onUpdateRole: (memberId: string, role: MinistryRole) => void
  onRemoveMember: (memberId: string) => void
  pagination?: {
    currentPage: number
    totalPages: number
    count: number
  }
  onPageChange?: (page: number) => void
}

export function MinistryMembersTable({
  members,
  isLoading,
  onUpdateRole,
  onRemoveMember,
  pagination,
  onPageChange,
}: MinistryMembersTableProps) {
  const getRoleIcon = (role: MinistryRole) => {
    switch (role) {
      case "LIDER":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "EQUIPO":
        return <UserCog className="h-4 w-4 text-blue-500" />
      case "MIEMBRO":
        return <UserIcon className="h-4 w-4 text-green-500" />
    }
  }

  const getRoleColor = (role: MinistryRole) => {
    switch (role) {
      case "LIDER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "EQUIPO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "MIEMBRO":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "INACTIVO":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "ASISTENTE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead className="hidden md:table-cell">DNI</TableHead>
              <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Cargando miembros...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay miembros en este ministerio
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {member.member_name} {member.member_last_name}
                      </span>
                      {member.member_email && (
                        <span className="text-xs text-muted-foreground">
                          {member.member_email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.dni_user}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {member.cell || "Sin teléfono"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(member.member_status)}>
                      {member.member_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        onUpdateRole(member.member_id, value as MinistryRole)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center gap-2">
                          
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIEMBRO">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-green-500" />
                            Miembro
                          </div>
                        </SelectItem>
                        <SelectItem value="EQUIPO">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-blue-500" />
                            Equipo
                          </div>
                        </SelectItem>
                        <SelectItem value="LIDER">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            Líder
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveMember(member.member_id)}
                      title="Eliminar del ministerio"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {members.length} de {pagination.count} miembros
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

