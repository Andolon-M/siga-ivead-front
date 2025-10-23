import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Download } from "lucide-react"

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes Financieros</h1>
          <p className="text-muted-foreground">Gestiona los reportes financieros</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reportes</CardTitle>
          <CardDescription>Próximamente - Página en construcción</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta página está en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  )
}

