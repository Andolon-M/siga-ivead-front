import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Search, Edit, Trash2, Church, Users as UsersIcon } from "lucide-react"
import type { Ministry } from "../types"
import { formatDateShort } from "@/shared/lib/date-utils"

interface MinistriesTableProps {
  ministries: Ministry[]
  onSearch: (query: string) => void
  onEdit: (ministry: Ministry) => void
  onDelete: (ministryId: string) => void
  onViewMembers?: (ministry: Ministry) => void
  isLoading?: boolean
  pagination: {
    currentPage: number
    totalPages: number
    count: number
  }
  onPageChange: (page: number) => void
}

export function MinistriesTable({
  ministries,
  onSearch,
  onEdit,
  onDelete,
  onViewMembers,
  isLoading,
  pagination,
  onPageChange,
}: MinistriesTableProps) {

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ministerio..."
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead className="hidden lg:table-cell">Miembros</TableHead>
              <TableHead className="hidden lg:table-cell">Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : ministries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron ministerios
                </TableCell>
              </TableRow>
            ) : (
              ministries.map((ministry) => (
                <TableRow 
                  key={ministry.id}
                  className={onViewMembers ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onViewMembers?.(ministry)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Church className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">{ministry.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs">
                    <span className="truncate block">{ministry.description || "Sin descripción"}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="secondary">
                      {ministry.total_members || 0} miembros
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDateShort(ministry.created_at)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {onViewMembers && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewMembers(ministry)}
                          title="Ver miembros"
                        >
                          <UsersIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(ministry)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(ministry.id)}
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

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {ministries.length} de {pagination.count} ministerios
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
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
              onClick={() => onPageChange(pagination.currentPage + 1)}
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

