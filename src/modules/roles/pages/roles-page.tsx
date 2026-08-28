import { useState, useEffect, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Shield,
  Plus,
  Key,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  Users,
  Church,
  CalendarDays,
  HandHeart,
  Calendar,
  FileText,
  DollarSign,
  Bot,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { rolesService } from "../services/roles.service"
import type { Role, Permission } from "../types"
import { Can } from "@/shared/components/auth/can"

// Mapeo amigable de módulos/recursos con nombres legibles e íconos
const RESOURCE_METADATA: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  members: { label: "Miembros", icon: Users },
  services: { label: "Cultos y Servicios", icon: CalendarDays },
  volunteers: { label: "Voluntariado", icon: HandHeart },
  ministries: { label: "Ministerios", icon: Church },
  events: { label: "Eventos", icon: Calendar },
  files: { label: "Archivos", icon: FileText },
  reports: { label: "Reportes Financieros", icon: DollarSign },
  users: { label: "Usuarios", icon: Users },
  roles: { label: "Roles", icon: Shield },
  permissions: { label: "Permisos", icon: Key },
  sara: { label: "Agente IA (SARA)", icon: Bot },
  mass_messaging: { label: "Mensajería Masiva", icon: Send },
  meta_templates: { label: "Plantillas WhatsApp", icon: FileText },
}

// Mapeo amigable de acciones
const ACTION_LABELS: Record<string, string> = {
  read: "Ver / Consultar",
  create: "Crear",
  update: "Editar / Modificar",
  delete: "Eliminar",
  export: "Exportar datos",
  import: "Importar datos",
  assign_user: "Asignar / Quitar usuario a miembro",
  generate_sessions: "Apartar fechas (generar cultos)",
  manage_service_roles: "Gestionar roles de servicio",
  assign_service_members: "Asignar miembros a roles de culto",
  manage_attendance: "Tomar y registrar asistencia",
  generate_occurrences: "Generar ocurrencias periódicas",
  assign_volunteers: "Asignar voluntarios",
  record_occurrences: "Registrar novedades / asistencia",
  manage_members: "Gestionar miembros y líderes",
  upload: "Subir archivos",
  create_income: "Registrar ingresos / ofrendas",
  create_expense: "Registrar egresos / gastos",
  assign_role: "Asignar rol a usuarios",
  assign_permissions: "Asignar permisos a roles",
  access: "Acceso general al módulo",
  read_chats: "Ver conversaciones",
  manage_chats: "Intervenir o pausar conversaciones",
  manage_prompts: "Configurar prompts de IA",
  read_campaigns: "Ver historial y métricas",
  create_campaign: "Lanzar nuevas campañas",
  cancel_campaign: "Cancelar campañas",
  retry_failed: "Reintentar mensajes fallidos",
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados de modales
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState("")
  const [isSavingRole, setIsSavingRole] = useState(false)

  // Estado del modal de permisos
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)
  const [permissionSearch, setPermissionSearch] = useState("")

  // Cargar roles y permisos iniciales
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [rolesData, permsData] = await Promise.all([
        rolesService.getAllRoles(),
        rolesService.getAllPermissions(),
      ])
      setRoles(rolesData)
      setAllPermissions(permsData)
    } catch (err) {
      console.error("Error al cargar roles y permisos:", err)
      setError("No se pudieron cargar los roles y permisos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Agrupar todos los permisos por recurso
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    allPermissions.forEach((perm) => {
      if (!groups[perm.resource]) {
        groups[perm.resource] = []
      }
      groups[perm.resource].push(perm)
    })
    return groups
  }, [allPermissions])

  // Abrir modal de nuevo rol
  const handleOpenCreateRole = () => {
    setEditingRole(null)
    setRoleName("")
    setIsRoleModalOpen(true)
  }

  // Abrir modal de editar rol
  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleName(role.name)
    setIsRoleModalOpen(true)
  }

  // Guardar rol (Crear o Actualizar)
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName.trim()) return

    setIsSavingRole(true)
    try {
      if (editingRole) {
        await rolesService.updateRole(editingRole.id, { name: roleName.trim() })
      } else {
        await rolesService.createRole({ name: roleName.trim() })
      }
      setIsRoleModalOpen(false)
      await loadData()
    } catch (err) {
      console.error("Error al guardar rol:", err)
      alert("Error al guardar rol. Por favor verifica que el nombre no esté duplicado.")
    } finally {
      setIsSavingRole(false)
    }
  }

  // Eliminar rol
  const handleDeleteRole = async (role: Role) => {
    const isProtectedRole =
      String(role.id) === "0" ||
      String(role.id) === "1" ||
      String(role.id) === "2" ||
      role.name === "Super Admin" ||
      role.name === "IA" ||
      role.name === "Administrador"

    if (isProtectedRole) {
      alert("No se puede eliminar un rol del sistema predeterminado.")
      return
    }
    if (!confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?`)) return

    try {
      await rolesService.deleteRole(role.id)
      await loadData()
    } catch (err) {
      console.error("Error al eliminar rol:", err)
      alert("No se pudo eliminar el rol.")
    }
  }

  // Abrir modal de asignación de permisos
  const handleOpenPermissionsModal = (role: Role) => {
    setSelectedRole(role)
    const assignedIds = role.permissions.map((p) => String(p.id))
    setSelectedPermissionIds(assignedIds)
    setPermissionSearch("")
    setIsPermModalOpen(true)
  }

  // Toggle de un permiso individual
  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  // Marcar / desmarcar todos los permisos de un módulo
  const toggleModulePermissions = (resource: string) => {
    const modulePerms = groupedPermissions[resource] || []
    const moduleIds = modulePerms.map((p) => String(p.id))
    const allSelected = moduleIds.every((id) => selectedPermissionIds.includes(id))

    if (allSelected) {
      // Desmarcar todos los de este módulo
      setSelectedPermissionIds((prev) => prev.filter((id) => !moduleIds.includes(id)))
    } else {
      // Marcar todos los de este módulo
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...moduleIds])))
    }
  }

  // Guardar asignación de permisos
  const handleSavePermissions = async () => {
    if (!selectedRole) return

    setIsSavingPermissions(true)
    try {
      await rolesService.assignPermissions(selectedRole.id, selectedPermissionIds)
      setIsPermModalOpen(false)
      await loadData()
    } catch (err) {
      console.error("Error al asignar permisos:", err)
      alert("Ocurrió un error al guardar los permisos del rol.")
    } finally {
      setIsSavingPermissions(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
          <p className="text-muted-foreground">
            Control de acceso basado en roles (RBAC) y gestión de permisos por módulo
          </p>
        </div>
        <Can resource="roles" action="create">
          <Button onClick={handleOpenCreateRole} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Rol
          </Button>
        </Can>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const isSuperAdmin = String(role.id) === "1" || role.name === "Super Admin"
            const isIA = String(role.id) === "0" || role.name === "IA"
            const isAdministrator = String(role.id) === "2" || role.name === "Administrador"
            const isProtectedRole = isSuperAdmin || isIA || isAdministrator
            const permCount = role.permissions?.length || 0

            return (
              <Card key={role.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg ${
                          isSuperAdmin
                            ? "bg-emerald-500/10 text-emerald-600"
                            : isIA
                            ? "bg-purple-500/10 text-purple-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isIA ? <Bot className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{role.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {isSuperAdmin
                            ? "Control total sin restricciones"
                            : isIA
                            ? "Reservado para el agente IA Sara"
                            : isProtectedRole
                            ? "Rol de sistema predeterminado"
                            : "Rol personalizado"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{isSuperAdmin ? "Nivel de acceso:" : "Permisos asignados:"}</span>
                    </div>
                    {isSuperAdmin ? (
                      <Badge className="bg-emerald-600 text-white font-medium text-xs">
                        Acceso Total (Wildcard)
                      </Badge>
                    ) : isIA ? (
                      <Badge className="bg-purple-600 text-white font-medium text-xs">
                        Exclusivo IA
                      </Badge>
                    ) : (
                      <Badge variant={permCount > 0 ? "default" : "secondary"}>
                        {permCount} {permCount === 1 ? "permiso" : "permisos"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {isSuperAdmin ? (
                      <div className="flex-1 py-1.5 px-3 text-center text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                        Acceso total automático
                      </div>
                    ) : isIA ? (
                      <div className="flex-1 py-1.5 px-3 text-center text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-md border border-purple-200 dark:border-purple-800/60">
                        Agente Autónomo
                      </div>
                    ) : (
                      <Can resource="roles" action="assign_permissions">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleOpenPermissionsModal(role)}
                        >
                          <Key className="h-3.5 w-3.5 mr-1.5" />
                          Permisos
                        </Button>
                      </Can>
                    )}

                    <Can resource="roles" action="update">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditRole(role)}
                        disabled={isSuperAdmin || isIA}
                        title={isSuperAdmin || isIA ? "Rol protegido" : "Editar nombre del rol"}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </Can>

                    <Can resource="roles" action="delete">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        disabled={isProtectedRole}
                        className="text-destructive hover:bg-destructive/10"
                        title={isProtectedRole ? "Rol protegido" : "Eliminar rol"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Can>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Crear / Editar Rol */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveRole}>
            <DialogHeader>
              <DialogTitle>{editingRole ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
              <DialogDescription>
                {editingRole
                  ? "Actualiza el nombre identificador para este rol de usuario."
                  : "Ingresa el nombre del nuevo rol para asignarle permisos posteriormente."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="role-name">Nombre del Rol</Label>
                <Input
                  id="role-name"
                  placeholder="Ej: Coordinador de Cultos, Líder de Diaconado..."
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingRole || !roleName.trim()}>
                {isSavingRole ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingRole ? "Guardar Cambios" : "Crear Rol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Avanzado de Asignación de Permisos */}
      <Dialog open={isPermModalOpen} onOpenChange={setIsPermModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Permisos para: <span className="text-primary">{selectedRole?.name}</span>
                </DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  Marca las acciones específicas que los usuarios con este rol tendrán autorización de ejecutar.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {selectedPermissionIds.length} de {allPermissions.length} asignados
              </Badge>
            </div>

            {/* Buscador de permisos dentro del modal */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrar permisos por módulo o acción..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => {
                const meta = RESOURCE_METADATA[resource] || { label: resource, icon: Key }
                const ModuleIcon = meta.icon

                // Filtrar si hay término de búsqueda
                const filteredPerms = perms.filter((p) => {
                  if (!permissionSearch) return true
                  const search = permissionSearch.toLowerCase()
                  const actionLabel = (ACTION_LABELS[p.action] || p.action).toLowerCase()
                  const moduleLabel = meta.label.toLowerCase()
                  return (
                    actionLabel.includes(search) ||
                    moduleLabel.includes(search) ||
                    p.resource.toLowerCase().includes(search) ||
                    p.action.toLowerCase().includes(search)
                  )
                })

                if (filteredPerms.length === 0) return null

                const moduleIds = perms.map((p) => String(p.id))
                const allSelected = moduleIds.every((id) => selectedPermissionIds.includes(id))
                const someSelected = moduleIds.some((id) => selectedPermissionIds.includes(id)) && !allSelected

                return (
                  <div key={resource} className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
                    {/* Cabecera del módulo */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                          <ModuleIcon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm">{meta.label}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">({resource})</span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleModulePermissions(resource)}
                      >
                        {allSelected ? "Desmarcar todos" : "Marcar todos"}
                      </Button>
                    </div>

                    {/* Checkboxes de acciones */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      {filteredPerms.map((perm) => {
                        const permIdStr = String(perm.id)
                        const isChecked = selectedPermissionIds.includes(permIdStr)
                        const actionText = ACTION_LABELS[perm.action] || perm.action

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                              isChecked
                                ? "bg-primary/5 border-primary/40 text-foreground"
                                : "hover:bg-accent/50 border-border text-muted-foreground"
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => togglePermission(permIdStr)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground leading-tight">
                                {actionText}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                {perm.resource}.{perm.action}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {selectedPermissionIds.length} permisos seleccionados
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPermModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
              >
                {isSavingPermissions ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                )}
                Guardar Permisos
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
