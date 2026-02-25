import { useState, useMemo } from "react"
import { User as UserIcon } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { SearchableEntitySelector } from "@/shared/components/searchable-entity-selector"
import { useUsers } from "@/modules/users/hooks/use-users"
import type { User } from "@/modules/users/types"

export interface UserSelectorProps {
  value?: string
  /** Solo id (retrocompatible) */
  onValueChange?: (userId: string | undefined) => void
  /** Id y datos del usuario seleccionado */
  onSelect?: (userId: string | undefined, user: User | undefined) => void
  placeholder?: string
}

/**
 * Selector de usuarios con búsqueda integrada.
 * Usa el componente genérico SearchableEntitySelector.
 * Puede usarse con onValueChange (solo id) o onSelect (id + datos).
 */
export function UserSelector({
  value,
  onValueChange,
  onSelect,
  placeholder = "Seleccionar usuario...",
}: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50,
    }),
    [searchQuery]
  )

  const { users, isLoading } = useUsers(filters)

  const handleSelect = (userId: string | undefined, user: User | undefined) => {
    onValueChange?.(userId)
    onSelect?.(userId, user)
  }

  return (
    <SearchableEntitySelector<User>
      value={value}
      onSelect={handleSelect}
      items={users}
      loading={isLoading}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Buscar por email o nombre..."
      emptyMessage="No se encontraron usuarios"
      placeholder={placeholder}
      renderTrigger={(selected) =>
        selected ? (
          <div className="flex items-center gap-2 truncate">
            <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{selected.email}</span>
            {selected.name && selected.last_name && (
              <Badge variant="secondary" className="shrink-0">
                {selected.name} {selected.last_name}
              </Badge>
            )}
          </div>
        ) : null
      }
      renderItem={(user) => (
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{user.email}</span>
            <Badge variant="outline" className="shrink-0 text-xs">
              {user.role_name}
            </Badge>
          </div>
          {user.name && user.last_name && (
            <span className="text-xs text-muted-foreground truncate">
              {user.name} {user.last_name}
              {user.member_status && ` • ${user.member_status}`}
            </span>
          )}
        </div>
      )}
    />
  )
}
