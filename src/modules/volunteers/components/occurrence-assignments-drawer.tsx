import { useEffect, useState } from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer"
import { Separator } from "@/shared/components/ui/separator"
import { Check, Plus, Trash2, X } from "lucide-react"
import { volunteersService } from "../services/volunteers.service"
import type { TaskAssignment, TaskOccurrence } from "../types"
import { AssignTaskDialog } from "./assign-task-dialog"

interface OccurrenceAssignmentsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  occurrence: TaskOccurrence | null
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "outline",
}

export function OccurrenceAssignmentsDrawer({ open, onOpenChange, occurrence }: OccurrenceAssignmentsDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const safeAssignments = Array.isArray(assignments) ? assignments : []

  const loadAssignments = async () => {
    if (!occurrence) return
    try {
      setLoading(true)
      const data = await volunteersService.getOccurrenceAssignments(occurrence.id)
      setAssignments(data)
    } catch (error) {
      console.error("Error al cargar asignaciones:", error)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !occurrence) return
    loadAssignments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, occurrence?.id])

  const handleAssign = async (payload: { member_id: string; notes?: string }) => {
    if (!occurrence) return
    await volunteersService.createTaskAssignment(occurrence.id, payload)
    await loadAssignments()
  }

  const handleConfirm = async (assignmentId: string) => {
    await volunteersService.confirmTaskAssignment(assignmentId)
    await loadAssignments()
  }

  const handleCancel = async (assignmentId: string) => {
    await volunteersService.cancelTaskAssignment(assignmentId)
    await loadAssignments()
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("¿Eliminar asignación seleccionada?")) return
    await volunteersService.deleteTaskAssignment(assignmentId)
    await loadAssignments()
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="max-w-xl">
          <DrawerHeader>
            <DrawerTitle>Asignaciones de ocurrencia</DrawerTitle>
            <DrawerDescription>
              {occurrence
                ? `${occurrence.task_name || "Tarea"} • ${new Date(occurrence.occurrence_date).toLocaleDateString()}`
                : "Selecciona una ocurrencia para ver detalles."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Cupos</p>
                <p className="text-xs text-muted-foreground">
                  {occurrence ? `${occurrence.assigned_count}/${occurrence.required_quantity} asignados` : "-"}
                </p>
              </div>
              <Button size="sm" onClick={() => setAssignDialogOpen(true)} disabled={!occurrence}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva asignación
              </Button>
            </div>

            <Separator />

            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando asignaciones...</p>
            ) : safeAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay asignaciones registradas.</p>
            ) : (
              <div className="space-y-3">
                {safeAssignments.map((assignment) => {
                  const memberName = assignment.members
                    ? `${assignment.members.name}${assignment.members.last_name ? ` ${assignment.members.last_name}` : ""}`
                    : assignment.member_name || assignment.member_id
                  
                  return (
                    <div key={assignment.id} className="rounded-lg border p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{memberName}</p>
                          <p className="text-xs text-muted-foreground">{assignment.notes || "Sin notas"}</p>
                        </div>
                        <Badge variant={statusVariant[assignment.status] || "outline"}>{assignment.status}</Badge>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleConfirm(assignment.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCancel(assignment.id)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(assignment.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AssignTaskDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} onSubmit={handleAssign} />
    </>
  )
}
