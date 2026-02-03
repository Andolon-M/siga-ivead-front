import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Users, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { meetingsService } from "../services/meetings.service"
import { useRequiredRoles } from "../hooks/use-roles"
import { useSessionAssignments, useRolesComplete } from "../hooks/use-assignments"
import { CreateRoleDialog } from "../components/create-role-dialog"
import { RolesTable } from "../components/roles-table"
import { AssignMemberDialog } from "../components/assign-member-dialog"
import { AssignmentsTable } from "../components/assignments-table"
import { extractDateOnly, formatTimeFromISO } from "@/shared/lib/date-utils"
import type { MeetingSession, CreateRequiredRoleRequest, CreateAssignmentRequest } from "../types"

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<MeetingSession | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false)

  const recurringMeetingId = session?.recurring_meeting_id ?? session?.recurring_meetings?.id

  const { roles, createRole, deleteRole, refetch: refetchRoles } = useRequiredRoles(recurringMeetingId)
  const {
    assignments,
    createAssignment,
    confirmAssignment,
    cancelAssignment,
    deleteAssignment,
    refetch: refetchAssignments,
  } = useSessionAssignments(id)
  const { isComplete } = useRolesComplete(id)

  useEffect(() => {
    if (id) {
      fetchSession()
    }
  }, [id])

  const fetchSession = async () => {
    if (!id) return
    try {
      setIsLoadingSession(true)
      const data = await meetingsService.getSessionById(id)
      setSession(data)
    } catch (error) {
      console.error("Error al cargar sesión:", error)
    } finally {
      setIsLoadingSession(false)
    }
  }

  const handleCreateRole = async (data: CreateRequiredRoleRequest) => {
    await createRole(data)
    setIsCreateRoleOpen(false)
  }

  const handleAssignMember = async (data: CreateAssignmentRequest) => {
    await createAssignment(data)
    setIsAssignMemberOpen(false)
  }

  const handleConfirmAssignment = async (assignmentId: string) => {
    await confirmAssignment(assignmentId)
  }

  const handleCancelAssignment = async (assignmentId: string) => {
    await cancelAssignment(assignmentId, "Cancelado por el coordinador")
  }

  const handleDeleteRole = async (roleId: string) => {
    if (confirm("¿Eliminar este rol? Las asignaciones existentes no se eliminarán.")) {
      await deleteRole(roleId)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm("¿Eliminar esta asignación?")) {
      await deleteAssignment(assignmentId)
    }
  }

  if (isLoadingSession) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Cargando sesión...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Sesión no encontrada</p>
        <Button onClick={() => navigate("/admin/services")} className="mt-4">
          Volver a Servicios
        </Button>
      </div>
    )
  }

  const meeting = session.recurring_meetings
  const dateStr = extractDateOnly(session.session_date)
  const timeStr = formatTimeFromISO(session.start_time)
  const formattedDate = dateStr
    ? format(new Date(dateStr + "T12:00:00"), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : ""

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/services")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{meeting?.name ?? "Sesión"}</h1>
          <p className="text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Roles completos
            </Badge>
          ) : (
            <Badge variant="secondary">Roles incompletos</Badge>
          )}
          <Badge variant="outline">{session.status}</Badge>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha</p>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Hora</p>
                <p className="text-sm text-muted-foreground">{timeStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">
                  {session.actual_location || meeting?.location || "Sin ubicación"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{assignments.length} asignaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {assignments.filter((a) => a.status === "CONFIRMADO").length} confirmados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="roles">Roles Requeridos</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Asignaciones de Servicio</h2>
              <p className="text-sm text-muted-foreground">
                Miembros asignados a roles en esta sesión
              </p>
            </div>
            <Button onClick={() => setIsAssignMemberOpen(true)} disabled={roles.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Asignar Miembro
            </Button>
          </div>
          <AssignmentsTable
            assignments={assignments}
            onConfirm={handleConfirmAssignment}
            onCancel={handleCancelAssignment}
            onDelete={handleDeleteAssignment}
          />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Roles Requeridos</h2>
              <p className="text-sm text-muted-foreground">
                Define qué roles se necesitan para esta reunión
              </p>
            </div>
            <Button onClick={() => setIsCreateRoleOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Rol
            </Button>
          </div>
          <RolesTable roles={roles} onDelete={handleDeleteRole} />
          <p className="text-xs text-muted-foreground">
            Los roles se aplican a todas las sesiones de esta reunión recurrente
          </p>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <CreateRoleDialog
        open={isCreateRoleOpen}
        onOpenChange={setIsCreateRoleOpen}
        onSubmit={handleCreateRole}
      />

      <AssignMemberDialog
        open={isAssignMemberOpen}
        onOpenChange={setIsAssignMemberOpen}
        roles={roles}
        onSubmit={handleAssignMember}
      />
    </div>
  )
}
