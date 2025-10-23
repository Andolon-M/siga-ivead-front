import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"

export function MembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Miembros</h1>
          <p className="text-muted-foreground">Gestiona los miembros de la iglesia</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Miembro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Miembros</CardTitle>
          <CardDescription>Próximamente - Página en construcción</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta página está en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  )
}

