import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { volunteersService } from "../services/volunteers.service"
import { useVolunteerTasks } from "../hooks/use-volunteer-tasks"
import type { CreateVolunteerTaskData, GenerateOccurrencesData, UpdateVolunteerTaskData, VolunteerTask } from "../types"
import { getVolunteerErrorMessage } from "../lib/errors"
import { CreateTaskDialog } from "../components/create-task-dialog"
import { EditTaskDialog } from "../components/edit-task-dialog"
import { GenerateOccurrencesDialog } from "../components/generate-occurrences-dialog"
import { TasksTable } from "../components/tasks-table"

export function VolunteersTasksPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<VolunteerTask | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: currentPage,
      pageSize,
    }),
    [searchQuery, currentPage, pageSize]
  )

  const { tasks, loading, error, pagination, refetch } = useVolunteerTasks(filters)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handleCreate = async (data: CreateVolunteerTaskData) => {
    try {
      setBusinessError(null)
      setIsSubmitting(true)
      await volunteersService.createTask(data)
      await refetch()
      setIsCreateOpen(false)
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo crear la tarea"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (task: VolunteerTask) => {
    setSelectedTask(task)
    setIsEditOpen(true)
  }

  const handleUpdate = async (data: UpdateVolunteerTaskData) => {
    if (!selectedTask) return
    try {
      setBusinessError(null)
      setIsSubmitting(true)
      await volunteersService.updateTask(selectedTask.id, data)
      await refetch()
      setIsEditOpen(false)
      setSelectedTask(null)
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo actualizar la tarea"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return
    try {
      setBusinessError(null)
      await volunteersService.deleteTask(taskId)
      await refetch()
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo eliminar la tarea"))
    }
  }

  const handleOpenGenerate = (task: VolunteerTask) => {
    setSelectedTask(task)
    setIsGenerateOpen(true)
  }

  const handleGenerate = async (taskId: string, data: GenerateOccurrencesData) => {
    try {
      setBusinessError(null)
      setIsSubmitting(true)
      await volunteersService.generateTaskOccurrences(taskId, data)
      setIsGenerateOpen(false)
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudieron generar las ocurrencias"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewOccurrences = (task: VolunteerTask) => {
    navigate(`/admin/volunteers/occurrences?taskId=${task.id}`)
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tareas de voluntarios</h1>
          <p className="text-muted-foreground">Administra catálogo recurrente, cupos y generación mensual.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={loading || isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>
      </div>

      {businessError ? (
        <Alert variant="destructive">
          <AlertTitle>Error de negocio</AlertTitle>
          <AlertDescription>{businessError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Listado de tareas</CardTitle>
          <CardDescription>
            {pagination ? `Mostrando ${tasks.length} de ${pagination.total} tareas` : "Lista completa de tareas de voluntariado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error al cargar tareas: {error.message}</p>
              <Button variant="outline" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <TasksTable
                tasks={tasks}
                onSearch={handleSearch}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateOccurrences={handleOpenGenerate}
                onViewOccurrences={handleViewOccurrences}
                isSearching={loading}
              />
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

      <CreateTaskDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreate} />
      <EditTaskDialog open={isEditOpen} onOpenChange={setIsEditOpen} task={selectedTask} onSubmit={handleUpdate} />
      <GenerateOccurrencesDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        task={selectedTask}
        onSubmit={handleGenerate}
      />
    </div>
  )
}
