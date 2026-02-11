import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { SearchInput } from "@/shared/components/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { CalendarPlus, Edit, Eye, Trash2 } from "lucide-react"
import type { VolunteerTask } from "../types"

interface TasksTableProps {
  tasks: VolunteerTask[]
  onSearch: (query: string) => void
  onEdit: (task: VolunteerTask) => void
  onDelete: (taskId: string) => void
  onGenerateOccurrences: (task: VolunteerTask) => void
  onViewOccurrences: (task: VolunteerTask) => void
  isSearching?: boolean
}

export function TasksTable({
  tasks,
  onSearch,
  onEdit,
  onDelete,
  onGenerateOccurrences,
  onViewOccurrences,
  isSearching,
}: TasksTableProps) {
  return (
    <div className="space-y-4">
      <SearchInput
        onSearch={onSearch}
        placeholder="Buscar tareas por nombre o descripción..."
        isSearching={isSearching}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarea</TableHead>
            <TableHead>Recurrencia</TableHead>
            <TableHead>Cupos</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No hay tareas registradas
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="font-medium">{task.name}</div>
                  {task.description ? <p className="text-xs text-muted-foreground">{task.description}</p> : null}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline">{task.recurrence_type}</Badge>
                    {task.day_of_week ? <p className="text-xs text-muted-foreground">{task.day_of_week}</p> : null}
                  </div>
                </TableCell>
                <TableCell>{task.default_quantity}</TableCell>
                <TableCell>{task.location || "Sin ubicación"}</TableCell>
                <TableCell>
                  <Badge variant={task.is_active ? "default" : "secondary"}>{task.is_active ? "Activa" : "Inactiva"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewOccurrences(task)} title="Ver ocurrencias">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onGenerateOccurrences(task)}
                      title="Generar ocurrencias"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(task)} title="Editar tarea">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} title="Eliminar tarea">
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
