import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Check, Clock3, Trash2, UserPlus, X } from "lucide-react"
import type { ActivityAssignment, ActivitySlot } from "../types"

interface SlotsBoardProps {
  slots: ActivitySlot[]
  assignments: ActivityAssignment[]
  onAssign: (slot: ActivitySlot) => void
  onConfirm: (assignmentId: string) => void
  onCancel: (assignmentId: string) => void
  onDelete: (assignmentId: string) => void
}

function findAssignment(slot: ActivitySlot, assignments: ActivityAssignment[]) {
  return assignments.find((assignment) => assignment.slot_id === slot.id)
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "outline",
}

export function SlotsBoard({ slots, assignments, onAssign, onConfirm, onCancel, onDelete }: SlotsBoardProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">Esta actividad aún no tiene slots generados.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {slots.map((slot) => {
        const assignment = findAssignment(slot, assignments)
        const isAssigned = !!assignment
        return (
          <Card key={slot.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {new Date(slot.start_time).toLocaleTimeString()} - {new Date(slot.end_time).toLocaleTimeString()}
                </span>
                {assignment ? <Badge variant={statusVariant[assignment.status] || "outline"}>{assignment.status}</Badge> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAssigned ? (
                <>
                  <div>
                    <p className="font-medium">{assignment?.member_name || assignment?.member_id}</p>
                    <p className="text-xs text-muted-foreground">{assignment?.notes || "Sin notas"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => assignment && onConfirm(assignment.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => assignment && onCancel(assignment.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => assignment && onDelete(assignment.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={() => onAssign(slot)} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Asignar voluntario
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
