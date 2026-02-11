import { Eye, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { SearchInput } from "@/shared/components/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import type { MetaTemplate } from "../types"

interface MetaTemplatesTableProps {
  templates: MetaTemplate[]
  onSearch: (query: string) => void
  onView: (templateId: string) => void
  onEdit: (template: MetaTemplate) => void
  onDelete: (template: MetaTemplate) => void
  isSearching?: boolean
}

export function MetaTemplatesTable({
  templates,
  onSearch,
  onView,
  onEdit,
  onDelete,
  isSearching,
}: MetaTemplatesTableProps) {
  return (
    <div className="space-y-4">
      <SearchInput onSearch={onSearch} placeholder="Buscar plantilla por nombre, id o idioma..." isSearching={isSearching} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Idioma</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Componentes</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No hay plantillas para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.language}</TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>
                  <Badge variant={template.status === "APPROVED" ? "default" : "secondary"}>
                    {template.status}
                  </Badge>
                </TableCell>
                <TableCell>{template.components.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(template.id)} title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(template)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(template)} title="Eliminar">
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

