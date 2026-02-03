import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Calendar, Plus, Download } from "lucide-react"
import { DayFilter } from "../components/day-filter"
import { ServiceCard } from "../components/service-card"
import { ServicesStats } from "../components/services-stats"
import { CreateServiceDialog } from "../components/create-service-dialog"
import { EditServiceDialog } from "../components/edit-service-dialog"
import { ApartarFechasDialog } from "../components/apartar-fechas-dialog"
import { useRecurringMeetings } from "../hooks/use-meetings"
import { useSessions } from "../hooks/use-sessions"
import { startOfDay, addDays, format } from "date-fns"
import type { RecurringMeeting, CreateRecurringMeetingRequest, UpdateRecurringMeetingRequest } from "../types"

export function ServicesPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfDay(new Date()))
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isApartarFechasOpen, setIsApartarFechasOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<RecurringMeeting | null>(null)

  const { meetings, createMeeting, updateMeeting, deleteMeeting, refetch: refetchMeetings } = useRecurringMeetings({
    is_active: true,
  })

  const dateFrom = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd")
  const dateTo = selectedDate
    ? format(addDays(selectedDate, 7), "yyyy-MM-dd")
    : format(addDays(new Date(), 7), "yyyy-MM-dd")

  const { sessions, generateSessions, refetch: refetchSessions } = useSessions({
    date_from: dateFrom,
    date_to: dateTo,
  })

  const filteredSessions = useMemo(() => {
    let result = sessions

    if (selectedDate) {
      result = result.filter((s) => {
        const sessionDate = s.session_date?.split("T")[0]
        const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
        return sessionDate === selectedDateStr
      })
    }

    return result
  }, [sessions, selectedDate])

  const upcomingCount = sessions.filter((s) => {
    const sessionDate = s.session_date?.split("T")[0]
    const today = format(new Date(), "yyyy-MM-dd")
    return sessionDate && sessionDate >= today
  }).length

  const handleCreateService = async (data: CreateRecurringMeetingRequest) => {
    await createMeeting(data)
    setIsCreateModalOpen(false)
  }

  const handleEditService = async (id: string, data: UpdateRecurringMeetingRequest) => {
    await updateMeeting(id, data)
    setIsEditModalOpen(false)
    setSelectedMeeting(null)
  }

  const handleApartarFechas = async (data: { recurring_meeting_id: string; year: number; month: number }) => {
    const result = await generateSessions(data)
    setIsApartarFechasOpen(false)
    return result
  }

  const handleEditMeeting = (meeting: RecurringMeeting) => {
    setSelectedMeeting(meeting)
    setIsEditModalOpen(true)
  }

  const handleServiceCardClick = (sessionId: string) => {
    navigate(`/admin/services/session/${sessionId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las reuniones semanales y cultos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ServicesStats
            upcomingCount={upcomingCount}
            participatingCount={0}
          />
          <Button variant="ghost" size="icon" title="Descargar">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsApartarFechasOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Apartar fechas
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      {/* Filtro por fecha - Días de la semana */}
      <DayFilter
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        daysToShow={14}
      />

      {/* Lista de servicios */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">
              No hay servicios en las fechas seleccionadas
            </p>
            <p className="text-sm mt-1">
              Crea un nuevo servicio o aparta fechas para generar sesiones
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                Nuevo Servicio
              </Button>
              <Button onClick={() => setIsApartarFechasOpen(true)}>
                Apartar fechas
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <ServiceCard
                key={session.id}
                session={session}
                onClick={() => handleServiceCardClick(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateServiceDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateService}
      />

      <EditServiceDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        service={selectedMeeting}
        onSubmit={handleEditService}
      />

      <ApartarFechasDialog
        open={isApartarFechasOpen}
        onOpenChange={setIsApartarFechasOpen}
        meetings={meetings}
        onSubmit={handleApartarFechas}
      />
    </div>
  )
}
