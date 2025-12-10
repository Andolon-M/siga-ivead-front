import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { CreateMemberDialog } from "../components/create-member-dialog"
import { EditMemberDialog } from "../components/edit-member-dialog"
import { MembersTable } from "../components/members-table"
import { useMembers } from "../hooks/use-members"
import { membersService } from "../services/members.service"
import type { Member, CreateMemberData, UpdateMemberData } from "../types"

export function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("") // Estado para el valor confirmado
  const [isSearching, setIsSearching] = useState(false) // Estado visual de "esperando/buscando"

  // Usar el hook real para obtener miembros con paginación
  const { members, loading, error, pagination, refetch, setFilters } = useMembers({
    page: 1,
    pageSize: 20,
  })
  
  // Efecto de debounce: Espera 1 segundo después de dejar de escribir
  useEffect(() => {
    // Si el texto está vacío, actualizar inmediatamente para limpiar
    if (searchQuery.trim() === "") {
      setDebouncedSearch("")
      setIsSearching(false)
      setFilters({ search: undefined, page: 1, pageSize: 20 })
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setIsSearching(false)
      // Actualizar filtros solo después del delay
      setFilters({ search: searchQuery, page: 1, pageSize: 20 })
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchQuery, setFilters])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Manejar cambio en la búsqueda (solo actualiza el input visualmente)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  // Mostrar loader centrado en la carga inicial (o primera búsqueda)
  if ((loading || isSearching) && members.length === 0) {
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Miembros</CardTitle>
              <CardDescription>
                {isSearching ? (
                  "Buscando..."
                ) : pagination ? (
                  `Mostrando ${members.length} de ${pagination.total} miembros`
                ) : (
                  "Todos los miembros registrados en la iglesia"
                )}
              </CardDescription>
            </div>
            {(loading || isSearching) && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
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
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
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
                      onClick={() => setFilters({ 
                        search: searchQuery || undefined,
                        page: pagination.previousPage!, 
                        pageSize: 20 
                      })}
                      disabled={!pagination.previousPage || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ 
                        search: searchQuery || undefined,
                        page: pagination.nextPage!, 
                        pageSize: 20 
                      })}
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

