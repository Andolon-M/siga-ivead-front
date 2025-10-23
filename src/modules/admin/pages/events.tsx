import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Plus, Calendar, Users } from "lucide-react"

export function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Servicio Dominical",
      date: "2025-01-26",
      location: "Templo Principal",
      capacity: 200,
      registered: 156,
      status: "ACTIVO",
    },
    {
      id: 2,
      title: "Retiro Juvenil 2025",
      date: "2025-02-15",
      location: "Centro de Retiros",
      capacity: 50,
      registered: 32,
      status: "PLANIFICADO",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gestiona los eventos de la iglesia</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.reduce((acc, e) => acc + e.registered, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
          <CardDescription>Todos los eventos programados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.date} - {event.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.registered}/{event.capacity} registrados
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalles
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

