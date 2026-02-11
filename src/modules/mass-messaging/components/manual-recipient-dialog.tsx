import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import type { ManualRecipientForm } from "../types"
import { isValidColombiaPhone, normalizePhone } from "../hooks/mass-messaging.utils"

interface ManualRecipientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allowNote: boolean
  onSubmit: (recipient: ManualRecipientForm) => void
}

export function ManualRecipientDialog({
  open,
  onOpenChange,
  allowNote,
  onSubmit,
}: ManualRecipientDialogProps) {
  const [form, setForm] = useState<ManualRecipientForm>({ name: "", phone: "", note: "" })
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm({ name: "", phone: "", note: "" })
      setPhoneError(null)
    }
  }, [open])

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("El nombre es obligatorio")
      return
    }

    const normalizedPhone = normalizePhone(form.phone)
    if (!isValidColombiaPhone(normalizedPhone)) {
      setPhoneError("El número debe iniciar con 57 y tener solo dígitos válidos")
      return
    }

    onSubmit({
      name: form.name.trim(),
      phone: normalizedPhone,
      note: allowNote ? form.note?.trim() : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar destinatario manual</DialogTitle>
          <DialogDescription>
            Registra una persona fuera del listado de miembros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-name">Nombre</Label>
            <Input
              id="manual-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nombre de la persona"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-phone">Número de WhatsApp</Label>
            <Input
              id="manual-phone"
              value={form.phone}
              onChange={(event) => {
                setPhoneError(null)
                setForm((current) => ({ ...current, phone: event.target.value }))
              }}
              placeholder="573001112233"
            />
            <p className="text-xs text-muted-foreground">Debe iniciar con 57. Puedes escribir +57 o 57.</p>
            {phoneError ? <p className="text-xs text-destructive">{phoneError}</p> : null}
          </div>

          {allowNote ? (
            <div className="space-y-2">
              <Label htmlFor="manual-note">Nota para personalización (opcional)</Label>
              <Textarea
                id="manual-note"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Contexto para personalizar el mensaje"
                rows={4}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

