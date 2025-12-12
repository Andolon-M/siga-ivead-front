import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { CreateMinistryDialog } from "../components/create-ministry-dialog"
import { EditMinistryDialog } from "../components/edit-ministry-dialog"
import { MinistriesStats } from "../components/ministries-stats"
import { MinistriesTable } from "../components/ministries-table"
import { useMinistries } from "../hooks/use-ministries"
import type {
  Ministry,
  CreateMinistryRequest,
  UpdateMinistryRequest,
} from "../types"

export function MinistriesPage() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(
    null
  )

  // Crear filtros con useMemo
  const filters = useMemo(
    () => ({
      page: currentPage,
      pageSize,
    }),
    [currentPage, pageSize]
  )

  const { ministries, stats, pagination, isLoading, createMinistry, updateMinistry, deleteMinistry } =
    useMinistries(filters)

  // Manejar cambio en la búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Resetear a la página 1 al buscar
    setCurrentPage(1)
  }

  // Filtrar ministerios localmente por búsqueda
  const filteredMinistries = useMemo(() => {
    if (!searchQuery.trim()) return ministries

    const query = searchQuery.toLowerCase()
    return ministries.filter(
      (ministry) =>
        ministry.name.toLowerCase().includes(query) ||
        ministry.description?.toLowerCase().includes(query)
    )
  }, [ministries, searchQuery])

  const handleCreateMinistry = async (data: CreateMinistryRequest) => {
    try {
      await createMinistry(data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error al crear ministerio:", error)
    }
  }

  const handleEditMinistry = (ministry: Ministry) => {
    setSelectedMinistry(ministry)
    setIsEditModalOpen(true)
  }

  const handleUpdateMinistry = async (data: UpdateMinistryRequest) => {
    if (!selectedMinistry) return

    try {
      await updateMinistry(selectedMinistry.id, data)
      setIsEditModalOpen(false)
      setSelectedMinistry(null)
    } catch (error) {
      console.error("Error al actualizar ministerio:", error)
    }
  }

  const handleDeleteMinistry = async (ministryId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este ministerio? Esta acción no se puede deshacer."
      )
    ) {
      return
    }

    try {
      await deleteMinistry(ministryId)
    } catch (error) {
      console.error("Error al eliminar ministerio:", error)
    }
  }

  const handleViewMembers = (ministry: Ministry) => {
    navigate(`/admin/ministries/${ministry.id}`)
  }

  if (isLoading && ministries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Ministerios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los ministerios de la iglesia
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ministerio
        </Button>
      </div>

      {/* Estadísticas */}
      <MinistriesStats stats={stats} />

      {/* Tabla de Ministerios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Ministerios</CardTitle>
              <CardDescription>
                {pagination.count} ministerio{pagination.count !== 1 ? "s" : ""}{" "}
                registrado{pagination.count !== 1 ? "s" : ""} en el sistema
              </CardDescription>
            </div>
            {isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <MinistriesTable
            ministries={filteredMinistries}
            onSearch={handleSearch}
            onEdit={handleEditMinistry}
            onDelete={handleDeleteMinistry}
            onViewMembers={handleViewMembers}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modales */}
      <CreateMinistryDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateMinistry}
      />

      <EditMinistryDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        ministry={selectedMinistry}
        onSubmit={handleUpdateMinistry}
      />
    </div>
  )
}
