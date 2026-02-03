import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, User as UserIcon, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"
import { useMembers } from "@/modules/members/hooks/use-members"

interface MemberSelectorProps {
  value?: string
  onValueChange: (memberId: string | undefined) => void
  placeholder?: string
}

/**
 * Selector de miembros activos con búsqueda integrada
 * Permite buscar y seleccionar un miembro de la lista de miembros activos
 */
export function MemberSelector({
  value,
  onValueChange,
  placeholder = "Seleccionar miembro...",
}: MemberSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Obtener miembros activos con búsqueda
  const filters = useMemo(
    () => ({
      status: "ACTIVO" as const,
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50, // Mostrar hasta 50 miembros
    }),
    [searchQuery]
  )

  const { members, isLoading } = useMembers(filters)

  // Encontrar el miembro seleccionado
  const selectedMember = members.find((member) => member.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedMember ? (
            <div className="flex items-center gap-2 truncate">
              <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {selectedMember.name} {selectedMember.last_name}
              </span>
              {selectedMember.cell && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {selectedMember.cell}
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
            placeholder="Buscar por nombre, DNI o teléfono..."
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
                <CommandEmpty>No se encontraron miembros activos</CommandEmpty>
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
                      (Ninguno - Sin miembro asignado)
                    </CommandItem>
                  )}

                  {members.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? undefined : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === member.id ? "opacity-100" : "opacity-0"
                        )}
                      />
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
                          {member.dni && (
                            <span className="truncate">
                              {member.tipo_dni}: {member.dni}
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
