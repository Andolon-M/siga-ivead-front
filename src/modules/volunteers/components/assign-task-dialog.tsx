import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { MemberSelector } from "@/modules/ministries/components/member-selector"
import type { CreateTaskAssignmentData } from "../types"

interface AssignTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTaskAssignmentData) => Promise<void> | void
}

export function AssignTaskDialog({ open, onOpenChange, onSubmit }: AssignTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [memberId, setMemberId] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState("")

  const handleSubmit = async () => {
    if (!memberId) {
      alert("Debes seleccionar un miembro")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        member_id: memberId,
        notes: notes.trim() || undefined,
      })
      setMemberId(undefined)
      setNotes("")
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar voluntario</DialogTitle>
          <DialogDescription>Selecciona un miembro y guarda notas opcionales para la asignación.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Miembro</Label>
            <MemberSelector value={memberId} onValueChange={setMemberId} placeholder="Seleccionar miembro..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-assignment-notes">Notas</Label>
            <Textarea
              id="task-assignment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Disponible en la mañana, observaciones, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
