import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, User as UserIcon, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"
import { useUsers } from "@/modules/users/hooks/use-users"
import type { User } from "@/modules/users/types"

interface UserSelectorProps {
  value?: string
  onValueChange: (userId: string | undefined) => void
  placeholder?: string
}

/**
 * Selector de usuarios con búsqueda integrada
 * Permite buscar y seleccionar un usuario de la lista disponible
 */
export function UserSelector({ value, onValueChange, placeholder = "Seleccionar usuario..." }: UserSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Obtener usuarios con búsqueda
  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50, // Mostrar hasta 50 usuarios
    }),
    [searchQuery]
  )

  const { users, isLoading } = useUsers(filters)

  // Encontrar el usuario seleccionado
  const selectedUser = users.find((user) => user.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 truncate">
              <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedUser.email}</span>
              {selectedUser.name && selectedUser.last_name && (
                <Badge variant="secondary" className="shrink-0">
                  {selectedUser.name} {selectedUser.last_name}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por email o nombre..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>No se encontraron usuarios</CommandEmpty>
                <CommandGroup>
                  {/* Opción para limpiar selección */}
                  {value && (
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        onValueChange(undefined)
                        setOpen(false)
                      }}
                      className="text-muted-foreground"
                    >
                      <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                      (Ninguno - Sin usuario asignado)
                    </CommandItem>
                  )}
                  
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? undefined : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
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
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

