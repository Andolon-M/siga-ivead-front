import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Plus } from "lucide-react"
import { CreateEventDialog } from "../components/create-event-dialog"
import { EditEventDialog } from "../components/edit-event-dialog"
import { EventsStats } from "../components/events-stats"
import { EventsTable } from "../components/events-table"
import type { Event, CreateEventData, UpdateEventData } from "../types"

// Mock data - En producción esto vendría de un hook o servicio
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Servicio Dominical",
    description: "Servicio de adoración para toda la familia",
    location: "Templo Principal",
    date: "2025-01-26",
    time: "9:00 AM",
    status: "ACTIVO",
    capacity: 200,
    registered: 156,
    hasPrice: false,
    ministry: "Ministerio de Alabanza",
  },
  {
    id: 2,
    title: "Retiro Juvenil 2025",
    description: "Retiro espiritual para jóvenes",
    location: "Centro de Retiros La Montaña",
    date: "2025-02-15",
    time: "8:00 AM",
    status: "PLANIFICADO",
    capacity: 50,
    registered: 32,
    hasPrice: true,
    price: 150000,
    ministry: "Ministerio Juvenil",
  },
  {
    id: 3,
    title: "Conferencia Familiar",
    description: "Conferencia sobre valores familiares",
    location: "Auditorio IVE",
    date: "2025-03-10",
    time: "6:00 PM",
    status: "PLANIFICADO",
    capacity: 150,
    registered: 45,
    hasPrice: false,
    ministry: "Ministerio Familiar",
  },
]

export function EventsPage() {
  const [events] = useState<Event[]>(mockEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const handleCreateEvent = (data: CreateEventData) => {
    console.log("Creating event:", data)
    // TODO: Implementar creación de evento
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleUpdateEvent = (data: UpdateEventData) => {
    console.log("Updating event:", selectedEvent?.id, data)
    // TODO: Implementar actualización de evento
    setIsEditModalOpen(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = (eventId: number) => {
    console.log("Deleting event:", eventId)
    // TODO: Implementar eliminación de evento
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gestiona los eventos de la iglesia</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <EventsStats events={events} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
          <CardDescription>Todos los eventos programados</CardDescription>
        </CardHeader>
        <CardContent>
          <EventsTable
            events={events}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </CardContent>
      </Card>

      <CreateEventDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateEvent}
      />

      <EditEventDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        event={selectedEvent}
        onSubmit={handleUpdateEvent}
      />
    </div>
  )
}

