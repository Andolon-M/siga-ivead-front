import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { CreateTemplateDialog } from "../components/create-template-dialog"
import { EditTemplateDialog } from "../components/edit-template-dialog"
import { MetaTemplatesTable } from "../components/meta-templates-table"
import { useMetaTemplates } from "../hooks/use-meta-templates"
import { metaTemplatesService } from "../services/meta-templates.service"
import type { CreateMetaTemplateData, MetaTemplate, UpdateMetaTemplateData } from "../types"

export function MetaTemplatesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: categoryFilter,
      status: statusFilter,
    }),
    [searchQuery, categoryFilter, statusFilter]
  )

  const { templates, loading, error, refetch } = useMetaTemplates(filters)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MetaTemplate | null>(null)

  const handleCreate = async (payload: CreateMetaTemplateData) => {
    await metaTemplatesService.createTemplate(payload)
    setCreateOpen(false)
    await refetch()
  }

  const handleEdit = async (templateId: string, payload: UpdateMetaTemplateData) => {
    await metaTemplatesService.updateTemplate(templateId, payload)
    setEditOpen(false)
    setSelectedTemplate(null)
    await refetch()
  }

  const handleDelete = async (template: MetaTemplate) => {
    if (!confirm(`¿Deseas eliminar la plantilla "${template.name}"?`)) return
    await metaTemplatesService.deleteTemplate(template.id)
    await refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plantillas WhatsApp</h1>
          <p className="text-muted-foreground">Gestiona plantillas de Meta para campañas y automatizaciones</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de plantillas</CardTitle>
          <CardDescription>Filtra y administra plantillas sincronizadas con Meta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="MARKETING">MARKETING</SelectItem>
                <SelectItem value="UTILITY">UTILITY</SelectItem>
                <SelectItem value="AUTHENTICATION">AUTHENTICATION</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="APPROVED">APPROVED</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando plantillas...
            </div>
          ) : null}

          {error ? (
            <div className="text-sm text-destructive">
              Error al cargar plantillas: {error.message}
            </div>
          ) : (
            <MetaTemplatesTable
              templates={templates}
              onSearch={setSearchQuery}
              onView={(id) => navigate(`/admin/meta-templates/${id}`)}
              onEdit={(template) => {
                setSelectedTemplate(template)
                setEditOpen(true)
              }}
              onDelete={handleDelete}
              isSearching={loading}
            />
          )}
        </CardContent>
      </Card>

      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <EditTemplateDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        template={selectedTemplate}
        onSubmit={handleEdit}
      />
    </div>
  )
}

