import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"

export function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles y Permisos</h1>
          <p className="text-muted-foreground">Gestiona los roles y permisos del sistema</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Roles</CardTitle>
          <CardDescription>Próximamente - Página en construcción</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta página está en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  )
}

