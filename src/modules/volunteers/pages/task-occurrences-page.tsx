import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CalendarDays, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { useTaskOccurrences } from "../hooks/use-task-occurrences"
import type { TaskOccurrence } from "../types"
import { OccurrenceAssignmentsDrawer } from "../components/occurrence-assignments-drawer"

export function TaskOccurrencesPage() {
  const [searchParams] = useSearchParams()
  const initialTaskId = searchParams.get("taskId") || ""
  const currentDate = new Date()

  const [taskIdFilter, setTaskIdFilter] = useState(initialTaskId)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedOccurrence, setSelectedOccurrence] = useState<TaskOccurrence | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filters = useMemo(
    () => ({
      task_id: taskIdFilter || undefined,
      year,
      month,
      page: currentPage,
      pageSize,
    }),
    [taskIdFilter, year, month, currentPage, pageSize]
  )

  const { occurrences, loading, error, pagination, refetch } = useTaskOccurrences(filters)
  const safeOccurrences = Array.isArray(occurrences) ? occurrences : []

  const openAssignments = (occurrence: TaskOccurrence) => {
    setSelectedOccurrence(occurrence)
    setDrawerOpen(true)
  }

  if (loading && occurrences.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ocurrencias de tareas</h1>
        <p className="text-muted-foreground">Filtra por mes y administra asignaciones por ocurrencia.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Configura período y tarea específica si lo necesitas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label htmlFor="occ-task-id">Task ID (opcional)</Label>
            <Input id="occ-task-id" value={taskIdFilter} onChange={(e) => setTaskIdFilter(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occ-year-filter">Año</Label>
            <Input
              id="occ-year-filter"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value || currentDate.getFullYear()))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occ-month-filter">Mes</Label>
            <Input id="occ-month-filter" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value || 1))} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" variant="outline" onClick={() => refetch()}>
              Aplicar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de ocurrencias</CardTitle>
          <CardDescription>
            {pagination
              ? `Mostrando ${occurrences.length} de ${pagination.total} ocurrencias`
              : "Resultados de ocurrencias para el filtro actual"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error al cargar ocurrencias: {error.message}</p>
              <Button variant="outline" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cupos</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeOccurrences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay ocurrencias para estos filtros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    safeOccurrences.map((occurrence) => (
                      <TableRow key={occurrence.id}>
                        <TableCell>{occurrence.task_name || occurrence.task_id}</TableCell>
                        <TableCell>{new Date(occurrence.occurrence_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {occurrence.assigned_count}/{occurrence.required_quantity}
                        </TableCell>
                        <TableCell>{occurrence.location || "Sin ubicación"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openAssignments(occurrence)}>
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Asignaciones
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.previousPage || loading}
                      onClick={() => setCurrentPage(pagination.previousPage || 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.nextPage || loading}
                      onClick={() => setCurrentPage(pagination.nextPage || pagination.currentPage)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <OccurrenceAssignmentsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} occurrence={selectedOccurrence} />
    </div>
  )
}
