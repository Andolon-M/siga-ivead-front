import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { MemberSelector } from "@/modules/ministries/components/member-selector"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { useMemberVolunteerHistory } from "../hooks/use-member-volunteer-history"
import { MemberVolunteerHistoryFilters } from "../components/member-volunteer-history-filters"

export function MemberVolunteerHistoryPage() {
  const [memberId, setMemberId] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [textFilter, setTextFilter] = useState("")

  const { history, loading, error, refetch } = useMemberVolunteerHistory(memberId)

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false
      if (typeFilter !== "all" && item.type !== typeFilter) return false
      if (textFilter.trim()) {
        const source = `${item.title} ${item.member_name || ""} ${item.location || ""}`.toLowerCase()
        if (!source.includes(textFilter.toLowerCase())) return false
      }
      return true
    })
  }, [history, statusFilter, typeFilter, textFilter])

  if (loading && memberId) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial por miembro</h1>
        <p className="text-muted-foreground">Consulta asignaciones de tareas y actividades para un miembro.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar miembro</CardTitle>
          <CardDescription>Busca y selecciona un miembro para consultar su historial.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Miembro</Label>
            <MemberSelector value={memberId} onValueChange={setMemberId} placeholder="Seleccionar miembro..." />
          </div>

          <MemberVolunteerHistoryFilters
            onSearchMember={setTextFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            searching={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            {memberId ? `Total registros encontrados: ${filteredHistory.length}` : "Selecciona un miembro para iniciar la consulta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!memberId ? (
            <p className="text-sm text-muted-foreground">Aún no has seleccionado un miembro.</p>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error al cargar historial: {error.message}</p>
              <Button variant="outline" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay asignaciones que coincidan con el filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "CONFIRMED" ? "default" : item.status === "PENDING" ? "secondary" : "outline"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.location || "Sin ubicación"}</TableCell>
                      <TableCell>{item.notes || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
