import { useState } from "react"
import { MemberSelector } from "@/modules/ministries/components/member-selector"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import type { ActivitySlot, CreateActivitySlotAssignmentData } from "../types"

interface AssignSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: ActivitySlot | null
  onSubmit: (data: CreateActivitySlotAssignmentData) => Promise<void> | void
}

export function AssignSlotDialog({ open, onOpenChange, slot, onSubmit }: AssignSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [memberId, setMemberId] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState("")

  const handleSubmit = async () => {
    if (!slot) return
    if (!memberId) {
      alert("Debes seleccionar un miembro para asignar el slot")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        slot_id: slot.id,
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
          <DialogTitle>Asignar slot</DialogTitle>
          <DialogDescription>
            {slot
              ? `Slot ${new Date(slot.start_time).toLocaleTimeString()} - ${new Date(slot.end_time).toLocaleTimeString()}`
              : "Selecciona un slot para asignar."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Miembro</Label>
            <MemberSelector value={memberId} onValueChange={setMemberId} placeholder="Seleccionar miembro..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-notes">Notas</Label>
            <Textarea
              id="slot-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones para esta asignación..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !slot}>
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
