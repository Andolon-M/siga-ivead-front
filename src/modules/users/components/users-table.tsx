import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Search, Edit, Trash2, Mail, Shield } from "lucide-react"
import type { User } from "../types"

interface UsersTableProps {
  users: User[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
}

export function UsersTable({ users, searchQuery, onSearchChange, onEdit, onDelete }: UsersTableProps) {
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Rol</TableHead>
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead className="min-w-[120px]">Fecha de Registro</TableHead>
                <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 whitespace-nowrap">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "Activo" ? "default" : "secondary"}
                      className="whitespace-nowrap"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{user.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          onEdit(user)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

