import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Plus } from "lucide-react"
import { CreateMinistryDialog } from "../components/create-ministry-dialog"
import { EditMinistryDialog } from "../components/edit-ministry-dialog"
import { MinistriesStats } from "../components/ministries-stats"
import { MinistriesTable } from "../components/ministries-table"
import type { Ministry, CreateMinistryData, UpdateMinistryData } from "../types"

// Mock data - En producción esto vendría de un hook o servicio
const mockMinistries: Ministry[] = [
  {
    id: 1,
    name: "Ministerio de Alabanza",
    description: "Encargado de la música y adoración en los servicios",
    members: 15,
    leader: "María García",
    created: "2024-01-10",
  },
  {
    id: 2,
    name: "Ministerio Juvenil",
    description: "Trabajo con jóvenes y adolescentes",
    members: 32,
    leader: "Carlos López",
    created: "2024-02-15",
  },
  {
    id: 3,
    name: "Ministerio de Niños",
    description: "Enseñanza y cuidado de los niños",
    members: 12,
    leader: "Ana Martínez",
    created: "2024-03-20",
  },
  {
    id: 4,
    name: "Ministerio de Intercesión",
    description: "Oración e intercesión por la iglesia",
    members: 8,
    leader: "Juan Pérez",
    created: "2024-04-05",
  },
]

export function MinistriesPage() {
  const [ministries] = useState<Ministry[]>(mockMinistries)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null)

  const handleCreateMinistry = (data: CreateMinistryData) => {
    console.log("Creating ministry:", data)
    // TODO: Implementar creación de ministerio
  }

  const handleEditMinistry = (ministry: Ministry) => {
    setSelectedMinistry(ministry)
    setIsEditModalOpen(true)
  }

  const handleUpdateMinistry = (data: UpdateMinistryData) => {
    console.log("Updating ministry:", selectedMinistry?.id, data)
    // TODO: Implementar actualización de ministerio
    setIsEditModalOpen(false)
    setSelectedMinistry(null)
  }

  const handleDeleteMinistry = (ministryId: number) => {
    console.log("Deleting ministry:", ministryId)
    // TODO: Implementar eliminación de ministerio
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ministerios</h1>
          <p className="text-muted-foreground">Gestiona los ministerios de la iglesia</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ministerio
        </Button>
      </div>

      <MinistriesStats ministries={ministries} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ministerios</CardTitle>
          <CardDescription>Todos los ministerios activos en la iglesia</CardDescription>
        </CardHeader>
        <CardContent>
          <MinistriesTable
            ministries={ministries}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEditMinistry}
            onDelete={handleDeleteMinistry}
          />
        </CardContent>
      </Card>

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

