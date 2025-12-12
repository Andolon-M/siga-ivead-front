# Módulo de Ministerios - SIGA IVEAD

## 📋 Resumen

El módulo de ministerios está completamente integrado con el backend de la API. Permite la gestión completa de ministerios y sus miembros, incluyendo asignación de roles (LÍDER, EQUIPO, MIEMBRO).

## 🔄 Implementación Completa

### 1. **Endpoints** (`src/shared/api/enpoints.ts`)

Todos los endpoints del backend han sido configurados:

#### Ministerios
- `GET /ministries` - Lista paginada o ministerio específico (con `?id=`)
- `POST /ministries` - Crear ministerio
- `PUT /ministries/:id` - Actualizar ministerio
- `DELETE /ministries/:id` - Eliminar ministerio (soft delete)
- `GET /ministries/stats` - Estadísticas generales

#### Miembros de Ministerios
- `GET /ministries/:ministryId/members` - Lista de miembros (con filtros opcionales)
- `POST /ministries/:ministryId/members` - Agregar miembro
- `DELETE /ministries/:ministryId/members/:memberId` - Eliminar miembro
- `PUT /ministries/:ministryId/members/:memberId/role` - Actualizar rol
- `GET /ministries/:ministryId/members/stats` - Estadísticas de miembros

#### Ministerios de un Miembro
- `GET /ministries/members/:memberId/ministries` - Lista de ministerios del miembro
- `GET /ministries/members/:memberId/stats` - Estadísticas del miembro

### 2. **Types** (`src/modules/ministries/types/index.ts`)

Tipos completos que coinciden con la API del backend:

```typescript
// Ministerio
interface Ministry {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  total_members?: number
  leaders_count?: number
  team_count?: number
  members_count?: number
  total_events?: number
}

// Miembro de Ministerio
interface MinistryMember {
  id: string
  ministry_id: string
  member_id: string
  role: "MIEMBRO" | "EQUIPO" | "LIDER"
  created_at: string
  updated_at: string
  member_name: string
  member_last_name: string
  dni_user: string
  cell: string
  member_status: "ASISTENTE" | "ACTIVO" | "INACTIVO"
  member_email?: string
}

// Estadísticas
interface MinistryStats {
  total_ministries: number
  total_members_in_ministries: number
  total_leaders: number
  total_team_members: number
  total_regular_members: number
  total_events_in_ministries: number
}
```

### 3. **Service** (`src/modules/ministries/services/ministries.service.ts`)

Servicio completo con todos los métodos:

#### CRUD de Ministerios
```typescript
getMinistries(filters?: MinistryFilters): Promise<Ministry | PaginatedResponse<Ministry>>
getMinistryById(id: string): Promise<Ministry>
createMinistry(data: CreateMinistryRequest): Promise<Ministry>
updateMinistry(id: string, data: UpdateMinistryRequest): Promise<Ministry>
deleteMinistry(id: string): Promise<void>
getStats(): Promise<MinistryStats>
```

#### Gestión de Miembros
```typescript
getMinistryMembers(filters: MinistryMemberFilters): Promise<MinistryMember | PaginatedResponse<MinistryMember>>
addMemberToMinistry(ministryId: string, data: AddMemberToMinistryRequest): Promise<MinistryMember>
removeMemberFromMinistry(ministryId: string, memberId: string): Promise<void>
updateMemberRole(ministryId: string, memberId: string, data: UpdateMemberRoleRequest): Promise<void>
getMinistryMemberStats(ministryId: string): Promise<MinistryMemberStats>
```

#### Ministerios de un Miembro
```typescript
getMemberMinistries(memberId: string): Promise<MemberMinistry[]>
getMemberStats(memberId: string): Promise<MemberStats>
```

### 4. **Hooks**

#### `useMinistries(filters?: MinistryFilters)`
Hook para gestionar la lista de ministerios con:
- Paginación automática
- Estadísticas generales
- CRUD completo
- Actualización automática

```typescript
const {
  ministries,           // Lista de ministerios
  stats,                // Estadísticas generales
  pagination,           // Info de paginación
  isLoading,            // Estado de carga
  error,                // Errores
  refetch,              // Refrescar datos
  createMinistry,       // Crear ministerio
  updateMinistry,       // Actualizar ministerio
  deleteMinistry,       // Eliminar ministerio
} = useMinistries(filters)
```

#### `useMinistryMembers(filters: MinistryMemberFilters)`
Hook para gestionar miembros de un ministerio con:
- Lista de miembros con filtros
- Estadísticas del ministerio
- Gestión de roles
- Agregar/eliminar miembros

```typescript
const {
  members,              // Lista de miembros
  stats,                // Estadísticas del ministerio
  pagination,           // Info de paginación
  isLoading,            // Estado de carga
  error,                // Errores
  refetch,              // Refrescar datos
  addMember,            // Agregar miembro
  removeMember,         // Eliminar miembro
  updateMemberRole,     // Actualizar rol
} = useMinistryMembers(filters)
```

### 5. **Componentes**

#### Ministerios
- **MinistriesPage**: Página principal con lista de ministerios
- **MinistryDetailPage**: Página de detalle con gestión de miembros
- **CreateMinistryDialog**: Diálogo para crear ministerio
- **EditMinistryDialog**: Diálogo para editar ministerio
- **MinistriesTable**: Tabla con ministerios, búsqueda y paginación
- **MinistriesStats**: Tarjetas de estadísticas

#### Miembros de Ministerios
- **AddMemberDialog**: Diálogo para agregar miembro con selector y rol
- **MemberSelector**: Selector de miembros con búsqueda
- **MinistryMembersTable**: Tabla de miembros con:
  - Cambio de rol en línea
  - Información del miembro
  - Estado del miembro
  - Acciones (eliminar)

### 6. **Rutas**

```typescript
/admin/ministries              // Lista de ministerios
/admin/ministries/:id          // Detalle del ministerio con gestión de miembros
```

## 🎯 Características Implementadas

### Gestión de Ministerios
- ✅ Crear, editar y eliminar ministerios
- ✅ Búsqueda local de ministerios
- ✅ Paginación del lado del servidor
- ✅ Estadísticas generales
- ✅ Validación de formularios
- ✅ Confirmación antes de eliminar

### Gestión de Miembros
- ✅ Agregar miembros con selector de búsqueda
- ✅ Asignar roles (MIEMBRO, EQUIPO, LIDER)
- ✅ Cambiar rol en línea
- ✅ Eliminar miembros del ministerio
- ✅ Estadísticas por ministerio
- ✅ Filtros por rol
- ✅ Paginación de miembros

### Roles en Ministerios
- **LIDER**: Líder del ministerio (solo puede haber uno, al asignar nuevo líder, el anterior pasa a EQUIPO)
- **EQUIPO**: Miembros del equipo de trabajo
- **MIEMBRO**: Miembros regulares del ministerio

### UI/UX
- ✅ Diseño responsive (mobile-first)
- ✅ Estados de carga
- ✅ Mensajes de error automáticos (toast)
- ✅ Confirmaciones de acciones destructivas
- ✅ Iconos descriptivos por rol y estado
- ✅ Badges con colores por rol y estado
- ✅ Navegación fluida entre páginas

## 📱 Responsive Design

- **Mobile**: Vista optimizada con columnas esenciales
- **Tablet**: Vista intermedia con más información
- **Desktop**: Vista completa con todas las columnas

## 🔒 Seguridad

- Todas las peticiones incluyen token de autenticación
- Validación de permisos en el backend
- Confirmación de acciones destructivas
- Manejo de errores con mensajes amigables

## 🚀 Uso

### Listar Ministerios

```typescript
import { useMinistries } from '@/modules/ministries'

function MyComponent() {
  const { ministries, stats, isLoading } = useMinistries({
    page: 1,
    pageSize: 20
  })
  
  // Usar ministries, stats, etc.
}
```

### Gestionar Miembros de un Ministerio

```typescript
import { useMinistryMembers } from '@/modules/ministries'

function MyComponent() {
  const { members, addMember, removeMember, updateMemberRole } = useMinistryMembers({
    ministryId: '1',
    page: 1,
    pageSize: 20
  })
  
  // Agregar miembro
  await addMember({ memberId: '123', role: 'MIEMBRO' })
  
  // Cambiar rol
  await updateMemberRole('123', { role: 'LIDER' })
  
  // Eliminar miembro
  await removeMember('123')
}
```

## 📝 Notas Importantes

1. **IDs como String**: Todos los IDs son strings para mantener consistencia con el backend
2. **Paginación**: El backend maneja la paginación, el frontend solo pasa los parámetros
3. **Búsqueda**: La búsqueda de ministerios se hace localmente, pero se puede implementar en el backend
4. **Roles**: Al asignar un nuevo LIDER, el backend automáticamente cambia el anterior a EQUIPO
5. **Soft Delete**: Los ministerios eliminados se marcan como eliminados pero no se borran físicamente

## 🐛 Debugging

Si hay problemas:
1. Verificar que el backend esté corriendo
2. Revisar la consola del navegador para errores
3. Verificar que los endpoints en `enpoints.ts` coincidan con el backend
4. Revisar que el token de autenticación sea válido

## 📦 Dependencias

El módulo usa:
- React 19
- React Router v7
- Axios para peticiones HTTP
- Shadcn/ui para componentes UI
- Lucide React para iconos
- Sonner para notificaciones toast

