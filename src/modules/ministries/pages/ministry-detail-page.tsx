import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Church,
  Users,
  Crown,
  UserCog,
  User as UserIcon,
  Loader2,
} from "lucide-react"
import { ministriesService } from "../services/ministries.service"
import { useMinistryMembers } from "../hooks/use-ministry-members"
import { AddMemberDialog } from "../components/add-member-dialog"
import { MinistryMembersTable } from "../components/ministry-members-table"
import type { Ministry, AddMemberToMinistryRequest, MinistryRole } from "../types"
import { useEffect } from "react"

export function MinistryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ministry, setMinistry] = useState<Ministry | null>(null)
  const [isLoadingMinistry, setIsLoadingMinistry] = useState(true)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Filtros para miembros
  const filters = useMemo(
    () => ({
      ministryId: id!,
      page: currentPage,
      pageSize: 20,
    }),
    [id, currentPage]
  )

  const { members, stats, pagination, isLoading, addMember, removeMember, updateMemberRole } =
    useMinistryMembers(filters)

  // Cargar ministerio
  useEffect(() => {
    if (id) {
      loadMinistry()
    }
  }, [id])

  const loadMinistry = async () => {
    try {
      setIsLoadingMinistry(true)
      const data = await ministriesService.getMinistryById(id!)
      setMinistry(data)
    } catch (error) {
      console.error("Error al cargar ministerio:", error)
    } finally {
      setIsLoadingMinistry(false)
    }
  }

  const handleAddMember = async (data: AddMemberToMinistryRequest) => {
    try {
      await addMember(data)
      setIsAddMemberOpen(false)
    } catch (error) {
      console.error("Error al agregar miembro:", error)
    }
  }

  const handleUpdateRole = async (memberId: string, role: MinistryRole) => {
    try {
      await updateMemberRole(memberId, { role })
    } catch (error) {
      console.error("Error al actualizar rol:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este miembro del ministerio?"
      )
    ) {
      return
    }

    try {
      await removeMember(memberId)
    } catch (error) {
      console.error("Error al eliminar miembro:", error)
    }
  }

  if (isLoadingMinistry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ministry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Ministerio no encontrado</p>
        <Button onClick={() => navigate("/admin/ministries")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Ministerios
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/ministries")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold">{ministry.name}</h1>
          </div>
          {ministry.description && (
            <p className="text-muted-foreground">{ministry.description}</p>
          )}
        </div>
        <Button onClick={() => setIsAddMemberOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      </div>

      {/* Estadísticas del Ministerio */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Miembros
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_members}</div>
              <p className="text-xs text-muted-foreground">
                En este ministerio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Líderes</CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leaders_count}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_members > 0
                  ? ((stats.leaders_count / stats.total_members) * 100).toFixed(
                      1
                    )
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipo</CardTitle>
              <UserCog className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.team_count}</div>
              <p className="text-xs text-muted-foreground">
                Miembros del equipo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembros</CardTitle>
              <UserIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.members_count}</div>
              <p className="text-xs text-muted-foreground">
                Miembros regulares
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de Miembros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Miembros del Ministerio</CardTitle>
              <CardDescription>
                {pagination.count} miembro{pagination.count !== 1 ? "s" : ""} en
                el ministerio
              </CardDescription>
            </div>
            {isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <MinistryMembersTable
            members={members}
            isLoading={isLoading}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Diálogo para agregar miembro */}
      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onSubmit={handleAddMember}
        ministryName={ministry.name}
      />
    </div>
  )
}

