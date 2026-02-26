import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CalendarDays, CalendarPlus, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { GenerateOccurrencesDialog } from "../components/generate-occurrences-dialog"
import { OccurrenceAssignmentsDrawer } from "../components/occurrence-assignments-drawer"
import { useTaskOccurrences } from "../hooks/use-task-occurrences"
import { useVolunteerTasks } from "../hooks/use-volunteer-tasks"
import { formatDateNumeric } from "@/shared/lib/date-utils"
import { getVolunteerErrorMessage } from "../lib/errors"
import { volunteersService } from "../services/volunteers.service"
import type { GenerateOccurrencesData, RecurrenceType, TaskOccurrence, VolunteerTask } from "../types"

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
]

const RECURRENCE_LABEL: Record<RecurrenceType, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  CUSTOM: "Personalizado",
}

const currentDate = new Date()
const currentYear = currentDate.getFullYear()

export function TaskOccurrencesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const taskIdFromUrl = searchParams.get("taskId") ?? undefined

  const [currentTask, setCurrentTask] = useState<VolunteerTask | null>(null)
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedOccurrence, setSelectedOccurrence] = useState<TaskOccurrence | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [isSubmittingGenerate, setIsSubmittingGenerate] = useState(false)

  const filters = useMemo(
    () => ({
      year: currentYear,
      month,
      task_id: taskIdFromUrl,
      page: currentPage,
      pageSize,
    }),
    [month, taskIdFromUrl, currentPage, pageSize]
  )

  const { occurrences, loading, error, pagination, refetch } = useTaskOccurrences(filters)
  const { tasks } = useVolunteerTasks({})
  const safeOccurrences = Array.isArray(occurrences) ? occurrences : []
  const safeTasks = Array.isArray(tasks) ? tasks : []

  useEffect(() => {
    if (!taskIdFromUrl) {
      setCurrentTask(null)
      return
    }
    const fromList = safeTasks.find((t) => t.id === taskIdFromUrl)
    if (fromList) {
      setCurrentTask(fromList)
      return
    }
    let cancelled = false
    volunteersService
      .getTaskById(taskIdFromUrl)
      .then((task) => {
        if (!cancelled) setCurrentTask(task)
      })
      .catch(() => {
        if (!cancelled) setCurrentTask(null)
      })
    return () => {
      cancelled = true
    }
  }, [taskIdFromUrl, safeTasks])

  const openAssignments = (occurrence: TaskOccurrence) => {
    setSelectedOccurrence(occurrence)
    setDrawerOpen(true)
  }

  const handleGenerateOccurrences = async (taskId: string, data: GenerateOccurrencesData) => {
    try {
      setBusinessError(null)
      setIsSubmittingGenerate(true)
      await volunteersService.generateTaskOccurrences(taskId, data)
      await refetch()
      setGenerateDialogOpen(false)
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudieron generar las ocurrencias"))
    } finally {
      setIsSubmittingGenerate(false)
    }
  }

  const handleSelectTask = (taskId: string) => {
    navigate(`/admin/volunteers/occurrences?taskId=${taskId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ocurrencias de tareas</h1>
        <p className="text-muted-foreground">Revisa la tarea, filtra por período y administra asignaciones por fecha.</p>
      </div>

      {businessError ? (
        <Alert variant="destructive">
          <AlertTitle>Error de negocio</AlertTitle>
          <AlertDescription>{businessError}</AlertDescription>
        </Alert>
      ) : null}

      {!taskIdFromUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona una tarea</CardTitle>
            <CardDescription>Elige la tarea de la que quieres ver y gestionar ocurrencias.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-sm">
              <Label>Tarea</Label>
              <Select value="" onValueChange={handleSelectTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tarea..." />
                </SelectTrigger>
                <SelectContent>
                  {safeTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : taskIdFromUrl && !currentTask ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : currentTask ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{currentTask.name}</CardTitle>
              {currentTask.description ? (
                <CardDescription className="whitespace-pre-wrap">{currentTask.description}</CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-around flex-wrap gap-5 text-sm">
                <div>
                  <span className="text-muted-foreground">Recurrencia: </span>
                  <Badge variant="outline">{RECURRENCE_LABEL[currentTask.recurrence_type]}</Badge>
                </div>
                {currentTask.day_of_week ? (
                  <div>
                    <span className="text-muted-foreground">Día: </span>
                    <span>{currentTask.day_of_week}</span>
                  </div>
                ) : null}
                <div>
                  <span className="text-muted-foreground">Personas requeridas: </span>
                  <span>{currentTask.default_quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lugar: </span>
                  <span>{currentTask.location || "Sin ubicación"}</span>
                </div>
                <div>
                  <Badge variant={currentTask.is_active ? "default" : "secondary"}>
                    {currentTask.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Configura el período para listar ocurrencias.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Año</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Año en curso: </span>
                    <span className="font-medium">{currentYear}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occ-month-filter">Mes</Label>
                  <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger id="occ-month-filter">
                      <SelectValue placeholder="Selecciona un mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end items-center gap-2">
                  <Button
                    onClick={() => setGenerateDialogOpen(true)}
                    disabled={isSubmittingGenerate}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Generar ocurrencias
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ocurrencias</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Actualizando…
                  </>
                ) : pagination ? (
                  `Mostrando ${occurrences.length} de ${pagination.total} ocurrencias`
                ) : (
                  "Fechas en las que se repite esta tarea"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {loading && safeOccurrences.length > 0 ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60" aria-hidden>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : null}
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
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cupos</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeOccurrences.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No hay ocurrencias para estos filtros.
                          </TableCell>
                        </TableRow>
                      ) : (
                        safeOccurrences.map((occurrence) => (
                          <TableRow key={occurrence.id}>
                            <TableCell>{formatDateNumeric(occurrence.occurrence_date)}</TableCell>
                            <TableCell>
                              {occurrence.assigned_count} / {occurrence.required_quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => openAssignments(occurrence)}>
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Asignar personas
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
        </>
      ) : null}

      <OccurrenceAssignmentsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} occurrence={selectedOccurrence} />
      <GenerateOccurrencesDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        task={currentTask}
        onSubmit={handleGenerateOccurrences}
      />
    </div>
  )
}
