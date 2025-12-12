import { useState, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { Check, ChevronsUpDown, UserIcon, Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useMembers } from "@/modules/members/hooks/use-members"

interface MemberSelectorProps {
  value?: string
  onValueChange: (memberId: string | undefined) => void
  placeholder?: string
}

/**
 * Selector de miembros con búsqueda integrada
 * Permite buscar y seleccionar un miembro de la lista disponible
 */
export function MemberSelector({
  value,
  onValueChange,
  placeholder = "Seleccionar miembro...",
}: MemberSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Obtener miembros con búsqueda
  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50, // Mostrar hasta 50 miembros
    }),
    [searchQuery]
  )

  const { members, loading } = useMembers(filters)

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
              <Badge variant="secondary" className="shrink-0">
                {selectedMember.status}
              </Badge>
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
            placeholder="Buscar miembro..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {searchQuery
                    ? "No se encontraron miembros"
                    : "Escribe para buscar miembros"}
                </CommandEmpty>
                <CommandGroup>
                  {value && (
                    <CommandItem
                      value="clear"
                      onSelect={() => {
                        onValueChange(undefined)
                        setOpen(false)
                      }}
                      className="justify-center text-sm text-muted-foreground"
                    >
                      Limpiar selección
                    </CommandItem>
                  )}

                  {members.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={(currentValue) => {
                        onValueChange(
                          currentValue === value ? undefined : currentValue
                        )
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
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {member.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {member.dni_user} • {member.cell || "Sin teléfono"}
                        </span>
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

