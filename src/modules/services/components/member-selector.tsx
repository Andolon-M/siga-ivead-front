import { useState, useMemo } from "react"
import { User as UserIcon } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { SearchableEntitySelector } from "@/shared/components/searchable-entity-selector"
import { useMembers } from "@/modules/members/hooks/use-members"
import type { Member } from "@/modules/members/types"

export interface MemberSelectorProps {
  value?: string
  /** Solo id (retrocompatible) */
  onValueChange?: (memberId: string | undefined) => void
  /** Id y datos del miembro seleccionado */
  onSelect?: (memberId: string | undefined, member: Member | undefined) => void
  placeholder?: string
}

/**
 * Selector de miembros activos con búsqueda integrada.
 * Usa el componente genérico SearchableEntitySelector.
 * Puede usarse con onValueChange (solo id) o onSelect (id + datos).
 */
export function MemberSelector({
  value,
  onValueChange,
  onSelect,
  placeholder = "Seleccionar miembro...",
}: MemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filters = useMemo(
    () => ({
      status: "ACTIVO" as const,
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50,
    }),
    [searchQuery]
  )

  const { members, loading } = useMembers(filters)

  const handleSelect = (memberId: string | undefined, member: Member | undefined) => {
    onValueChange?.(memberId)
    onSelect?.(memberId, member)
  }

  return (
    <SearchableEntitySelector<Member>
      value={value}
      onSelect={handleSelect}
      items={members}
      loading={loading}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Buscar por nombre, DNI o teléfono..."
      emptyMessage="No se encontraron miembros activos"
      placeholder={placeholder}
      renderTrigger={(selected) =>
        selected ? (
          <div className="flex items-center gap-2 truncate">
            <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selected.name} {selected.last_name}
            </span>
            {selected.cell && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {selected.cell}
              </Badge>
            )}
          </div>
        ) : null
      }
      renderItem={(member) => (
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {member.name} {member.last_name}
            </span>
            {member.status && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {member.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {member.dni_user && (
              <span className="truncate">
                {member.tipo_dni}: {member.dni_user}
              </span>
            )}
            {member.cell && (
              <>
                <span>•</span>
                <span className="truncate">{member.cell}</span>
              </>
            )}
          </div>
        </div>
      )}
    />
  )
}
