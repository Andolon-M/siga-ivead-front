import { Button } from "@/shared/components/ui/button"
import { SearchInput } from "@/shared/components/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Edit, Grid2x2, Trash2 } from "lucide-react"
import type { VolunteerActivity } from "../types"

interface ActivitiesTableProps {
  activities: VolunteerActivity[]
  onSearch: (query: string) => void
  onEdit: (activity: VolunteerActivity) => void
  onDelete: (activityId: string) => void
  onViewSlots: (activity: VolunteerActivity) => void
  isSearching?: boolean
}

export function ActivitiesTable({
  activities,
  onSearch,
  onEdit,
  onDelete,
  onViewSlots,
  isSearching,
}: ActivitiesTableProps) {
  const safeActivities = Array.isArray(activities) ? activities : []
  return (
    <div className="space-y-4">
      <SearchInput
        onSearch={onSearch}
        placeholder="Buscar actividad por nombre o descripción..."
        isSearching={isSearching}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actividad</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Duración slot</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeActivities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No hay actividades registradas
              </TableCell>
            </TableRow>
          ) : (
            safeActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="font-medium">{activity.name}</div>
                  {activity.description ? <p className="text-xs text-muted-foreground">{activity.description}</p> : null}
                </TableCell>
                <TableCell>{new Date(activity.activity_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {new Date(activity.start_time).toLocaleTimeString()} - {new Date(activity.end_time).toLocaleTimeString()}
                </TableCell>
                <TableCell>{activity.slot_duration_minutes} min</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewSlots(activity)} title="Ver tablero de slots">
                      <Grid2x2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(activity)} title="Editar actividad">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)} title="Eliminar actividad">
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
