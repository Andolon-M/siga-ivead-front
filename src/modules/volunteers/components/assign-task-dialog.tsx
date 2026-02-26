import { useState, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"
import { SearchableEntitySelector } from "@/shared/components/searchable-entity-selector"
import { User as UserIcon } from "lucide-react"
import { useMembers } from "@/modules/members/hooks/use-members"
import type { Member } from "@/modules/members/types"
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
  const [searchQuery, setSearchQuery] = useState("")

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50,
    }),
    [searchQuery]
  )
  const { members, loading } = useMembers(filters)

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
            <SearchableEntitySelector<Member>
              value={memberId}
              onSelect={(id) => setMemberId(id)}
              items={members}
              loading={loading}
              onSearchChange={setSearchQuery}
              placeholder="Seleccionar miembro..."
              searchPlaceholder="Buscar miembro..."
              emptyMessage="No se encontraron miembros"
              allowClear
              renderTrigger={(selected) =>
                selected ? (
                  <div className="flex items-center gap-2 truncate">
                    <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {selected.name} {selected.last_name}
                    </span>
                    <Badge variant="secondary" className="shrink-0">
                      {selected.status}
                    </Badge>
                  </div>
                ) : null
              }
              renderItem={(member) => (
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {member.name} {member.last_name}
                    </span>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {member.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {member.dni_user} • {member.cell || "Sin teléfono"}
                  </span>
                </div>
              )}
            />
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
