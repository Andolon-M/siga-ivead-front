import { useMemo, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { TemplateComponentsEditor } from "./template-components-editor"
import {
  buildCreatePayload,
  createEmptyTemplateFormState,
  validateTemplateFormState,
  type MetaTemplateFormState,
} from "./template-form.utils"
import type { CreateMetaTemplateData } from "../types"

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateMetaTemplateData) => Promise<void>
}

const CATEGORIES = ["MARKETING", "UTILITY", "AUTHENTICATION"]

export function CreateTemplateDialog({ open, onOpenChange, onSubmit }: CreateTemplateDialogProps) {
  const [form, setForm] = useState<MetaTemplateFormState>(() => createEmptyTemplateFormState())
  const [submitting, setSubmitting] = useState(false)

  const validationError = useMemo(() => validateTemplateFormState(form), [form])

  const handleCreate = async () => {
    const error = validateTemplateFormState(form)
    if (error) {
      alert(error)
      return
    }
    try {
      setSubmitting(true)
      await onSubmit(buildCreatePayload(form))
      setForm(createEmptyTemplateFormState())
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear plantilla de WhatsApp</DialogTitle>
          <DialogDescription>Configura los campos básicos y los componentes de la plantilla.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="ej. bienvenida_cliente"
              />
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Input
                value={form.language}
                onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
                placeholder="es_CO"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}
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
            onChange={(components) => setForm((current) => ({ ...current, components }))}
          />

          {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            Crear plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

