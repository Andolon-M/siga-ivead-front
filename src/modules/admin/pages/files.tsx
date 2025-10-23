import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Upload } from "lucide-react"

export function FilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Archivos</h1>
          <p className="text-muted-foreground">Gestiona los archivos del sistema</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Subir Archivo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrador de Archivos</CardTitle>
          <CardDescription>Próximamente - Página en construcción</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta página está en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  )
}

