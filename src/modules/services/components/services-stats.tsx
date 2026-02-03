import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Calendar, Users, Church } from "lucide-react"
import type { MeetingSession } from "../types"

interface ServicesStatsProps {
  upcomingCount: number
  participatingCount?: number
  totalSessions?: number
  sessions?: MeetingSession[]
}

export function ServicesStats({
  upcomingCount,
  participatingCount = 0,
  totalSessions = 0,
}: ServicesStatsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          Próximos: <strong className="text-foreground">{upcomingCount}</strong>
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          Participando: <strong className="text-foreground">{participatingCount}</strong>
        </span>
      </div>
    </div>
  )
}
