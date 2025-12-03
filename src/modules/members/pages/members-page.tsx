import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Plus } from "lucide-react"
import { CreateMemberDialog } from "../components/create-member-dialog"
import { EditMemberDialog } from "../components/edit-member-dialog"
import { MembersTable } from "../components/members-table"
import type { Member, CreateMemberData, UpdateMemberData } from "../types"

// Mock data - En producción esto vendría de un hook o servicio
const mockMembers: Member[] = [
  {
    id: 1,
    name: "Juan Pérez",
    dni: "1234567890",
    phone: "300-123-4567",
    status: "ACTIVO",
    gender: "MASCULINO",
    birthdate: "1990-05-15",
  },
  {
    id: 2,
    name: "María García",
    dni: "0987654321",
    phone: "310-987-6543",
    status: "ACTIVO",
    gender: "FEMENINO",
    birthdate: "1985-08-22",
  },
  {
    id: 3,
    name: "Carlos López",
    dni: "1122334455",
    phone: "320-555-1234",
    status: "ASISTENTE",
    gender: "MASCULINO",
    birthdate: "1995-03-10",
  },
  {
    id: 4,
    name: "Ana Martínez",
    dni: "5544332211",
    phone: "315-444-5678",
    status: "INACTIVO",
    gender: "FEMENINO",
    birthdate: "1988-11-30",
  },
]

export function MembersPage() {
  const [members] = useState<Member[]>(mockMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const handleCreateMember = (data: CreateMemberData) => {
    console.log("Creating member:", data)
    // TODO: Implementar creación de miembro
  }

  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleUpdateMember = (data: UpdateMemberData) => {
    console.log("Updating member:", selectedMember?.id, data)
    // TODO: Implementar actualización de miembro
    setIsEditModalOpen(false)
    setSelectedMember(null)
  }

  const handleDeleteMember = (memberId: number) => {
    console.log("Deleting member:", memberId)
    // TODO: Implementar eliminación de miembro
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Miembros</h1>
          <p className="text-muted-foreground">Gestiona los miembros de la iglesia</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Miembro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Miembros</CardTitle>
          <CardDescription>Todos los miembros registrados en la iglesia</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable
            members={members}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
          />
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

