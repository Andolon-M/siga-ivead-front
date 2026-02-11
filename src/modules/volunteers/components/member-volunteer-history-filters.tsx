import { SearchInput } from "@/shared/components/search-input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

interface MemberVolunteerHistoryFiltersProps {
  onSearchMember: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  searching?: boolean
}

export function MemberVolunteerHistoryFilters({
  onSearchMember,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  searching,
}: MemberVolunteerHistoryFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2">
        <SearchInput
          onSearch={onSearchMember}
          placeholder="Buscar miembro por nombre o documento..."
          isSearching={searching}
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de asignación</Label>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="TASK">Tareas</SelectItem>
            <SelectItem value="ACTIVITY">Actividades</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
