import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Calendar, Users } from "lucide-react"
import type { Event } from "../types"

interface EventsStatsProps {
  events: Event[]
}

export function EventsStats({ events }: EventsStatsProps) {
  const totalEvents = events.length
  const activeEvents = events.filter((e) => e.status === "ACTIVO").length
  const totalRegistered = events.reduce((acc, e) => acc + e.registered, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeEvents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Registrados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRegistered}</div>
        </CardContent>
      </Card>
    </div>
  )
}

