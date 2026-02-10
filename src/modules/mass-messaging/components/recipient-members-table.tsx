import { Badge } from "@/shared/components/ui/badge"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import type { Member } from "@/modules/members/types"

interface RecipientMembersTableProps {
  members: Member[]
  selectedIds: string[]
  onToggleMember: (memberId: string, checked: boolean) => void
  onToggleAllPage: (checked: boolean) => void
}

const statusColors = {
  ACTIVO: "default",
  ASISTENTE: "secondary",
  INACTIVO: "destructive",
  VISITANTE: "outline",
} as const

export function RecipientMembersTable({
  members,
  selectedIds,
  onToggleMember,
  onToggleAllPage,
}: RecipientMembersTableProps) {
  const selectableMembers = members.filter((member) => !!member.cell)
  const selectedOnPage = selectableMembers.filter((member) => selectedIds.includes(member.id)).length
  const allPageSelected = selectableMembers.length > 0 && selectedOnPage === selectableMembers.length

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={(checked) => onToggleAllPage(Boolean(checked))}
              aria-label="Seleccionar todos en esta página"
            />
          </TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Género</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              No se encontraron miembros para este filtro.
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => {
            const disabled = !member.cell
            return (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(member.id)}
                    disabled={disabled}
                    onCheckedChange={(checked) => onToggleMember(member.id, Boolean(checked))}
                    aria-label={`Seleccionar ${member.name} ${member.last_name}`}
                  />
                </TableCell>
                <TableCell>
                  {member.name} {member.last_name}
                </TableCell>
                <TableCell>{member.cell || "Sin teléfono"}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[member.status] as "default" | "secondary" | "destructive" | "outline"}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>{member.gender}</TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

