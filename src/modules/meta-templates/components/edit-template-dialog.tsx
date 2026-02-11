import { useEffect, useMemo, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { TemplateComponentsEditor } from "./template-components-editor"
import {
  buildUpdatePayload,
  createTemplateFormStateFromTemplate,
  validateTemplateFormState,
  type MetaTemplateFormState,
} from "./template-form.utils"
import type { MetaTemplate, UpdateMetaTemplateData } from "../types"

interface EditTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: MetaTemplate | null
  onSubmit: (templateId: string, payload: UpdateMetaTemplateData) => Promise<void>
}

const CATEGORIES = ["MARKETING", "UTILITY", "AUTHENTICATION"]

export function EditTemplateDialog({ open, onOpenChange, template, onSubmit }: EditTemplateDialogProps) {
  const [form, setForm] = useState<MetaTemplateFormState | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!template) {
      setForm(null)
      return
    }
    setForm(createTemplateFormStateFromTemplate(template))
  }, [template])

  const validationError = useMemo(() => {
    if (!form) return null
    return validateTemplateFormState(form)
  }, [form])

  const handleUpdate = async () => {
    if (!template || !form) return
    const error = validateTemplateFormState(form)
    if (error) {
      alert(error)
      return
    }
    try {
      setSubmitting(true)
      await onSubmit(template.id, buildUpdatePayload(form))
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar plantilla</DialogTitle>
          <DialogDescription>Actualiza la configuración de la plantilla seleccionada.</DialogDescription>
        </DialogHeader>

        {!form ? (
          <p className="text-sm text-muted-foreground">Selecciona una plantilla para editar.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => current ? { ...current, name: event.target.value } : current)}
                  placeholder="ej. bienvenida_cliente"
                />
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Input
                  value={form.language}
                  onChange={(event) => setForm((current) => current ? { ...current, language: event.target.value } : current)}
                  placeholder="es_CO"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm((current) => current ? { ...current, category: value } : current)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TemplateComponentsEditor
              value={form.components}
              onChange={(components) => setForm((current) => current ? { ...current, components } : current)}
            />

            {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={submitting || !template || !form}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

