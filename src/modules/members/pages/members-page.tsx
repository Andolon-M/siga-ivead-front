import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Plus, Loader2, Download, Filter } from "lucide-react"
import { CreateMemberDialog } from "../components/create-member-dialog"
import { EditMemberDialog } from "../components/edit-member-dialog"
import { MembersTable } from "../components/members-table"
import { useMembers } from "../hooks/use-members"
import { membersService } from "../services/members.service"
import type { Member, CreateMemberData, UpdateMemberData, MemberStatus, Gender } from "../types"

export function MembersPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<MemberStatus[]>([])
  const [genderFilter, setGenderFilter] = useState<Gender | "ALL">("ALL")
  const [ageGroupFilter, setAgeGroupFilter] = useState<"ADULT" | "MINOR" | "ALL">("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Crear filtros con useMemo
  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      status: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
      gender: genderFilter !== "ALL" ? genderFilter : undefined,
      ageGroup: ageGroupFilter !== "ALL" ? ageGroupFilter : undefined,
      page: currentPage,
      pageSize,
    }),
    [searchQuery, statusFilters, genderFilter, ageGroupFilter, currentPage, pageSize]
  )

  const toggleStatusFilter = (status: MemberStatus) => {
    setStatusFilters(prev => {
      const isSelected = prev.includes(status)
      if (isSelected) {
        return prev.filter(s => s !== status)
      } else {
        return [...prev, status]
      }
    })
    setCurrentPage(1)
  }

  // Usar el hook con los filtros dinámicos
  const { members, loading, error, pagination, refetch } = useMembers(filters)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Exportar Excel
  const handleExport = async () => {
    try {
      setIsExporting(true)
      await membersService.exportMembers({
        search: filters.search,
        status: filters.status,
        gender: filters.gender,
        ageGroup: filters.ageGroup,
      })
    } catch (error) {
      console.error("Error al exportar:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Crear miembro
  const handleCreateMember = async (data: CreateMemberData) => {
    try {
      setIsSubmitting(true)
      await membersService.createMember(data)
      setIsCreateModalOpen(false)
      // Recargar la lista de miembros
      await refetch()
    } catch (error) {
      console.error("Error al crear miembro:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Abrir diálogo de edición
  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  // Actualizar miembro
  const handleUpdateMember = async (data: UpdateMemberData) => {
    if (!selectedMember) return

    try {
      setIsSubmitting(true)
      await membersService.updateMember(selectedMember.id, data)
      setIsEditModalOpen(false)
      setSelectedMember(null)
      // Recargar la lista de miembros
      await refetch()
    } catch (error) {
      console.error("Error al actualizar miembro:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar miembro
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este miembro?")) {
      return
    }

    try {
      await membersService.deleteMember(memberId)
      // Recargar la lista de miembros
      await refetch()
    } catch (error) {
      console.error("Error al eliminar miembro:", error)
    }
  }

  // Manejar cambio en la búsqueda
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Resetear a la página 1 al buscar
    setCurrentPage(1)
  }, [])

  // Ver detalles de un miembro
  const handleViewDetails = (memberId: string) => {
    navigate(`/admin/members/${memberId}`)
  }

  // Mostrar loader centrado en la carga inicial
  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Miembros</h1>
          <p className="text-muted-foreground">Gestiona los miembros de la iglesia</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Miembro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div>
              <CardTitle>Lista de Miembros</CardTitle>
              <CardDescription>
                {pagination ? (
                  `Mostrando ${members.length} de ${pagination.total} miembros`
                ) : (
                  "Todos los miembros registrados en la iglesia"
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              <Button variant="outline" onClick={handleExport} disabled={isExporting || (members.length === 0 && !loading)}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Exportar a Excel
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between font-normal text-muted-foreground">
                  {statusFilters.length === 0 ? "Todos los estados" : `${statusFilters.length} estado(s)`}
                  <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={statusFilters.includes("ACTIVO")} onCheckedChange={() => toggleStatusFilter("ACTIVO")}>
                  Activo
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes("ASISTENTE")} onCheckedChange={() => toggleStatusFilter("ASISTENTE")}>
                  Asistente
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes("INACTIVO")} onCheckedChange={() => toggleStatusFilter("INACTIVO")}>
                  Inactivo
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes("VISITANTE")} onCheckedChange={() => toggleStatusFilter("VISITANTE")}>
                  Visitante
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={genderFilter} onValueChange={(v: any) => { setGenderFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los géneros</SelectItem>
                <SelectItem value="MASCULINO">Masculino</SelectItem>
                <SelectItem value="FEMENINO">Femenino</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ageGroupFilter} onValueChange={(v: any) => { setAgeGroupFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Edad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las edades</SelectItem>
                <SelectItem value="ADULT">Mayores de edad</SelectItem>
                <SelectItem value="MINOR">Menores de edad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error al cargar miembros: {error.message}</p>
              <Button onClick={refetch} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <MembersTable
                members={members}
                onSearch={handleSearch}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                onViewDetails={handleViewDetails}
                isSearching={loading}
              />

              {/* Paginación */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.previousPage!)}
                      disabled={!pagination.previousPage || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.nextPage!)}
                      disabled={!pagination.nextPage || loading}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateMemberDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateMember}
      />

      <EditMemberDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={selectedMember}
        onSubmit={handleUpdateMember}
      />
    </div>
  )
}

