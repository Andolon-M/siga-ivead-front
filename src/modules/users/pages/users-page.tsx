import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Plus } from "lucide-react"
import { CreateUserDialog } from "../components/create-user-dialog"
import { EditUserDialog } from "../components/edit-user-dialog"
import { UsersTable } from "../components/users-table"
import type { User, CreateUserData, UpdateUserData } from "../types"

// Mock data - En producción esto vendría de un hook o servicio
const mockUsers: User[] = [
  { id: 1, email: "admin@ivead.org", role: "Administrador", status: "Activo", created: "2024-01-15" },
  { id: 2, email: "pastor@ivead.org", role: "Pastor", status: "Activo", created: "2024-02-20" },
  { id: 3, email: "lider@ivead.org", role: "Líder", status: "Activo", created: "2024-03-10" },
  { id: 4, email: "miembro@ivead.org", role: "Miembro", status: "Inactivo", created: "2024-04-05" },
]

export function UsersPage() {
  const [users] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleCreateUser = (data: CreateUserData) => {
    console.log("Creating user:", data)
    // TODO: Implementar creación de usuario
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = (data: UpdateUserData) => {
    console.log("Updating user:", selectedUser?.id, data)
    // TODO: Implementar actualización de usuario
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = (userId: number) => {
    console.log("Deleting user:", userId)
    // TODO: Implementar eliminación de usuario
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Todos los usuarios registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </CardContent>
      </Card>

      <CreateUserDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateUser}
      />

      <EditUserDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        onSubmit={handleUpdateUser}
      />
    </div>
  )
}

