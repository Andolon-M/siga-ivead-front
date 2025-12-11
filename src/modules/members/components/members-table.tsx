import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Search, Edit, Trash2, User, Phone } from "lucide-react"
import type { Member } from "../types"

interface MembersTableProps {
  members: Member[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onEdit: (member: Member) => void
  onDelete: (memberId: string) => void
}

const statusColors = {
  ACTIVO: "default",
  ASISTENTE: "secondary",
  INACTIVO: "outline",
} as const

export function MembersTable({ members, searchQuery, onSearchChange, onEdit, onDelete }: MembersTableProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o DNI..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

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
            <TableRow key={member.id}>
              <TableCell className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {member.name} {member.last_name}
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
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onEdit(member)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(member.id)}>
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

