import { Loader2 } from "lucide-react"
import { useParams } from "react-router-dom"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useMetaTemplate } from "../hooks/use-meta-template"

export function MetaTemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { template, loading, error } = useMetaTemplate(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No se pudo cargar la plantilla</CardTitle>
          <CardDescription>{error?.message ?? "Plantilla no encontrada"}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{template.name}</h1>
        <p className="text-muted-foreground">Detalle y vista previa de componentes de la plantilla</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>ID: {template.id}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">{template.language}</Badge>
          <Badge variant="outline">{template.category}</Badge>
          <Badge variant={template.status === "APPROVED" ? "default" : "secondary"}>{template.status}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Componentes</CardTitle>
          <CardDescription>Vista estructurada según configuración en Meta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {template.components.map((component, index) => (
            <div key={`${component.type}-${index}`} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{component.type}</Badge>
                {component.format ? <Badge variant="secondary">{component.format}</Badge> : null}
              </div>
              {component.text ? (
                <p className="text-sm whitespace-pre-wrap">{component.text}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Sin texto definido.</p>
              )}
              {component.buttons?.length ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Botones</p>
                  {component.buttons.map((button, buttonIndex) => (
                    <div key={`${button.type}-${buttonIndex}`} className="rounded-md bg-muted/40 p-2 text-xs">
                      <p>Tipo: {button.type}</p>
                      {button.text ? <p>Texto: {button.text}</p> : null}
                      {button.url ? <p>URL: {button.url}</p> : null}
                      {button.phone_number ? <p>Teléfono: {button.phone_number}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

