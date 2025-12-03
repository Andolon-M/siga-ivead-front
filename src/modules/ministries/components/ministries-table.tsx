import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Search, Edit, Trash2, Church } from "lucide-react"
import type { Ministry } from "../types"

interface MinistriesTableProps {
  ministries: Ministry[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onEdit: (ministry: Ministry) => void
  onDelete: (ministryId: number) => void
}

export function MinistriesTable({
  ministries,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
}: MinistriesTableProps) {
  const filteredMinistries = ministries.filter(
    (ministry) =>
      ministry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ministry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ministry.leader.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ministerio..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Líder</TableHead>
            <TableHead>Miembros</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMinistries.map((ministry) => (
            <TableRow key={ministry.id}>
              <TableCell className="flex items-center gap-2 font-medium">
                <Church className="h-4 w-4 text-primary" />
                {ministry.name}
              </TableCell>
              <TableCell className="max-w-xs truncate">{ministry.description}</TableCell>
              <TableCell>{ministry.leader}</TableCell>
              <TableCell>
                <Badge variant="secondary">{ministry.members} miembros</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onEdit(ministry)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(ministry.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

