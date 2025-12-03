import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Church, Users } from "lucide-react"
import type { Ministry } from "../types"

interface MinistriesStatsProps {
  ministries: Ministry[]
}

export function MinistriesStats({ ministries }: MinistriesStatsProps) {
  const totalMinistries = ministries.length
  const totalMembers = ministries.reduce((acc, m) => acc + m.members, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ministerios</CardTitle>
          <Church className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMinistries}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
        </CardContent>
      </Card>
    </div>
  )
}

