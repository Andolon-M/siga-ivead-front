import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useVolunteerActivities } from "../hooks/use-volunteer-activities"
import { volunteersService } from "../services/volunteers.service"
import type { CreateVolunteerActivityData, UpdateVolunteerActivityData, VolunteerActivity } from "../types"
import { getVolunteerErrorMessage } from "../lib/errors"
import { ActivitiesTable } from "../components/activities-table"
import { CreateActivityDialog } from "../components/create-activity-dialog"
import { EditActivityDialog } from "../components/edit-activity-dialog"

export function VolunteersActivitiesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<VolunteerActivity | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: currentPage,
      pageSize,
    }),
    [searchQuery, currentPage, pageSize]
  )

  const { activities, loading, error, pagination, refetch } = useVolunteerActivities(filters)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handleCreate = async (data: CreateVolunteerActivityData) => {
    try {
      setBusinessError(null)
      setSubmitting(true)
      await volunteersService.createActivity(data)
      await refetch()
      setCreateOpen(false)
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo crear la actividad"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (activity: VolunteerActivity) => {
    setSelectedActivity(activity)
    setEditOpen(true)
  }

  const handleUpdate = async (data: UpdateVolunteerActivityData) => {
    if (!selectedActivity) return
    try {
      setBusinessError(null)
      setSubmitting(true)
      await volunteersService.updateActivity(selectedActivity.id, data)
      await refetch()
      setEditOpen(false)
      setSelectedActivity(null)
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo actualizar la actividad"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    if (!confirm("¿Deseas eliminar esta actividad?")) return
    try {
      setBusinessError(null)
      await volunteersService.deleteActivity(activityId)
      await refetch()
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo eliminar la actividad"))
    }
  }

  const handleViewSlots = (activity: VolunteerActivity) => {
    navigate(`/admin/volunteers/activities/${activity.id}/slots`)
  }

  if (loading && activities.length === 0) {
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
          <h1 className="text-3xl font-bold">Actividades por slots</h1>
          <p className="text-muted-foreground">Gestiona actividades, horarios y tablero de asignaciones por slot.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={loading || submitting}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva actividad
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
          <CardTitle>Listado de actividades</CardTitle>
          <CardDescription>
            {pagination
              ? `Mostrando ${activities.length} de ${pagination.total} actividades`
              : "Listado de actividades del módulo de voluntarios"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error al cargar actividades: {error.message}</p>
              <Button variant="outline" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <ActivitiesTable
                activities={activities}
                onSearch={handleSearch}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewSlots={handleViewSlots}
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

      <CreateActivityDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <EditActivityDialog open={editOpen} onOpenChange={setEditOpen} activity={selectedActivity} onSubmit={handleUpdate} />
    </div>
  )
}
