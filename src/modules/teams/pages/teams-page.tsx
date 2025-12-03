import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Users, Plus, UserPlus } from "lucide-react"
import type { WorkTeam } from "../types"

const mockTeams: WorkTeam[] = [
  { id: 1, name: "Equipo de Alabanza", leader: "Juan Pérez", memberCount: 8, created_at: "2024-01-15" },
  { id: 2, name: "Equipo de Multimedia", leader: "María García", memberCount: 5, created_at: "2024-02-20" },
  { id: 3, name: "Equipo de Intercesión", leader: "Carlos López", memberCount: 12, created_at: "2024-03-10" },
]

export function TeamsPage() {
  const [teams] = useState<WorkTeam[]>(mockTeams)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipos de Trabajo</h1>
          <p className="text-muted-foreground">Gestiona los equipos de trabajo de la iglesia</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </div>
              </div>
              <CardDescription>Líder: {team.leader}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Miembros</span>
                <Badge variant="secondary">{team.memberCount} personas</Badge>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Equipo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

