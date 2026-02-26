import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useActivitySlots } from "../hooks/use-activity-slots"
import { getVolunteerErrorMessage } from "../lib/errors"
import { volunteersService } from "../services/volunteers.service"
import type { ActivitySlot, VolunteerActivity } from "../types"
import { AssignSlotDialog } from "../components/assign-slot-dialog"
import { SlotsBoard } from "../components/slots-board"

export function ActivitySlotsBoardPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<VolunteerActivity | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ActivitySlot | null>(null)
  const [businessError, setBusinessError] = useState<string | null>(null)

  const { slots, assignments, loading, error, refetch } = useActivitySlots(id)

  useEffect(() => {
    if (!id) return
    const loadActivity = async () => {
      try {
        const data = await volunteersService.getActivityById(id)
        setActivity(data)
      } catch (err) {
        setBusinessError(getVolunteerErrorMessage(err, "No se pudo cargar la actividad"))
      }
    }
    loadActivity()
  }, [id])

  const handleOpenAssign = (slot: ActivitySlot) => {
    setSelectedSlot(slot)
    setAssignDialogOpen(true)
  }

  const handleAssign = async (payload: { slot_id: string; member_id: string; notes?: string }) => {
    if (!id) return
    try {
      setBusinessError(null)
      await volunteersService.assignActivitySlot(id, payload)
      await refetch()
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo asignar el slot"))
    }
  }

  const handleConfirm = async (assignmentId: string) => {
    try {
      setBusinessError(null)
      await volunteersService.confirmActivityAssignment(assignmentId)
      await refetch()
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo confirmar la asignación"))
    }
  }

  const handleCancel = async (assignmentId: string) => {
    try {
      setBusinessError(null)
      await volunteersService.cancelActivityAssignment(assignmentId)
      await refetch()
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo cancelar la asignación"))
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("¿Eliminar esta asignación de slot?")) return
    try {
      setBusinessError(null)
      await volunteersService.deleteActivityAssignment(assignmentId)
      await refetch()
    } catch (err) {
      setBusinessError(getVolunteerErrorMessage(err, "No se pudo eliminar la asignación"))
    }
  }

  if (loading && slots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/volunteers/activities")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tablero de slots</h1>
          <p className="text-muted-foreground">{activity ? `${activity.name} • ${new Date(activity.activity_date).toLocaleDateString()}` : "Actividad"}</p>
        </div>
      </div>

      {businessError ? (
        <Alert variant="destructive">
          <AlertTitle>Error de negocio</AlertTitle>
          <AlertDescription>{businessError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Asignaciones por slot</CardTitle>
          <CardDescription>Asigna miembros y gestiona confirmación/cancelación por turno.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error al cargar slots: {error.message}</p>
              <Button variant="outline" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : (
            <SlotsBoard
              slots={slots}
              assignments={assignments}
              onAssign={handleOpenAssign}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <AssignSlotDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} slot={selectedSlot} onSubmit={handleAssign} />
    </div>
  )
}
