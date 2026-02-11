import { Button } from "@/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { SearchInput } from "@/shared/components/search-input"
import { Edit, Trash2, User, Phone, Eye } from "lucide-react"
import type { Member } from "../types"

interface MembersTableProps {
  members: Member[]
  onSearch: (query: string) => void
  onEdit: (member: Member) => void
  onDelete: (memberId: string) => void
  onViewDetails?: (memberId: string) => void
  isSearching?: boolean
}

const statusColors = {
  ACTIVO: "default",
  ASISTENTE: "secondary",
  INACTIVO: "destructive",
  VISITANTE: "outline",
} as const

export function MembersTable({ members, onSearch, onEdit, onDelete, onViewDetails, isSearching }: MembersTableProps) {
  return (
    <div className="space-y-4">
      <SearchInput
        onSearch={onSearch}
        placeholder="Buscar por nombre o DNI..."
        isSearching={isSearching}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Género</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No se encontraron miembros
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow
                key={member.id}
                className={onViewDetails ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onViewDetails?.(member.id)}
              >
                <TableCell className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground " />
                  {member.name.charAt(0).toUpperCase() + member.name.slice(1)} {member.last_name?.charAt(0).toUpperCase() + member?.last_name?.slice(1)}
                </TableCell>
                <TableCell>{member.dni_user}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {member.cell}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[member.status] as any}>{member.status}</Badge>
                </TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onEdit(member)
                      }}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(member.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

