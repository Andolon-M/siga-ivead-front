import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import type { GenerateOccurrencesData, VolunteerTask } from "../types"

interface GenerateOccurrencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: VolunteerTask | null
  onSubmit: (taskId: string, data: GenerateOccurrencesData) => Promise<void> | void
}

const currentDate = new Date()

export function GenerateOccurrencesDialog({ open, onOpenChange, task, onSubmit }: GenerateOccurrencesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth() + 1)

  const handleSubmit = async () => {
    if (!task) return
    if (month < 1 || month > 12) {
      alert("El mes debe estar entre 1 y 12")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(task.id, { year, month })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar ocurrencias</DialogTitle>
          <DialogDescription>
            {task ? `Crear ocurrencias para "${task.name}" en un período mensual.` : "Selecciona una tarea primero."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occ-year">Año</Label>
            <Input id="occ-year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value || 0))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occ-month">Mes</Label>
            <Input id="occ-month" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value || 0))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !task}>
            Generar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
