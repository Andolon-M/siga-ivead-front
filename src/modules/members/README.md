# Módulo de Members

Este módulo gestiona todo lo relacionado con los miembros del sistema, incluyendo CRUD completo, estadísticas y búsquedas avanzadas.

## 📋 Contenido

- [Tipos](#tipos)
- [Servicio](#servicio)
- [Hooks](#hooks)
- [Ejemplos de Uso](#ejemplos-de-uso)

## Tipos

### Member

```typescript
interface Member {
  id: string
  user_id: string
  dni_user: string
  name: string
  last_name: string
  tipo_dni: DocumentType
  birthdate: string
  gender: Gender
  cell: string
  direccion: string
  status: MemberStatus
  created_at: string
  updated_at: string
  user_email: string
  total_ministries: string
  leadership_count: string
  team_count: string
  membership_count: string
  total_events_attended: string
}
```

### CreateMemberData

```typescript
interface CreateMemberData {
  user_id: string
  dni_user: string
  name: string
  last_name: string
  tipo_dni: DocumentType
  birthdate: string
  gender: Gender
  cell: string
  direccion: string
  status?: MemberStatus // Por defecto: "ASISTENTE"
}
```

### UpdateMemberData

```typescript
interface UpdateMemberData {
  user_id?: string
  dni_user?: string
  name?: string
  last_name?: string
  tipo_dni?: DocumentType
  birthdate?: string
  gender?: Gender
  cell?: string
  direccion?: string
  status?: MemberStatus
}
```

### MemberFilters

```typescript
interface MemberFilters {
  id?: string              // Buscar por ID específico
  dni?: string             // Buscar por DNI específico
  userId?: string          // Buscar por User ID específico
  search?: string          // Buscar por nombre o apellido
  status?: MemberStatus    // Filtrar por estado
  gender?: Gender          // Filtrar por género
  tipo_dni?: DocumentType  // Filtrar por tipo de documento
  page?: number            // Página actual (paginación)
  pageSize?: number        // Tamaño de página (paginación)
}
```

### MemberStats

```typescript
interface MemberStats {
  total_members: number
  asistente_count: number
  activo_count: number
  inactivo_count: number
  masculino_count: number
  femenino_count: number
  with_user_count: number
  without_user_count: number
  cc_count: number
  ti_count: number
  rc_count: number
  pp_count: number
  ce_count: number
  pep_count: number
  dni_count: number
}
```

## Servicio

### membersService

#### `getMembers(filters?: MemberFilters)`

Obtiene todos los miembros con paginación y filtros, o un miembro específico si se proporciona `id`, `dni` o `userId`.

```typescript
// Obtener todos los miembros (paginado)
const data = await membersService.getMembers()

// Filtrar por estado
const activos = await membersService.getMembers({ status: "ACTIVO" })

// Buscar por nombre
const resultado = await membersService.getMembers({ search: "Juan" })

// Paginación
const page2 = await membersService.getMembers({ page: 2, pageSize: 20 })

// Buscar por ID específico (retorna un solo Member)
const member = await membersService.getMembers({ id: "1" })
```

#### `getMemberById(id: string)`

Obtiene un miembro específico por ID.

```typescript
const member = await membersService.getMemberById("1")
```

#### `getMemberByDni(dni: string)`

Obtiene un miembro específico por DNI.

```typescript
const member = await membersService.getMemberByDni("12345678")
```

#### `getMemberByUserId(userId: string)`

Obtiene un miembro específico por User ID.

```typescript
const member = await membersService.getMemberByUserId("1")
```

#### `getStats()`

Obtiene estadísticas generales de miembros.

```typescript
const stats = await membersService.getStats()
console.log(`Total de miembros: ${stats.total_members}`)
console.log(`Miembros activos: ${stats.activo_count}`)
```

#### `createMember(data: CreateMemberData)`

Crea un nuevo miembro.

```typescript
const newMember = await membersService.createMember({
  user_id: "1",
  dni_user: "12345678",
  name: "Juan",
  last_name: "Pérez",
  tipo_dni: "CC",
  birthdate: "1990-01-01",
  gender: "MASCULINO",
  cell: "3001234567",
  direccion: "Calle 123 #45-67",
  status: "ACTIVO"
})
```

#### `updateMember(id: string, data: UpdateMemberData)`

Actualiza un miembro existente.

```typescript
const updated = await membersService.updateMember("1", {
  cell: "3009876543",
  direccion: "Nueva dirección"
})
```

#### `deleteMember(id: string)`

Elimina un miembro (soft delete).

```typescript
await membersService.deleteMember("1")
```

## Hooks

### useMembers(initialFilters?: MemberFilters)

Hook principal para gestionar la lista de miembros con paginación y filtros.

```typescript
function MembersListComponent() {
  const { 
    members, 
    loading, 
    error, 
    pagination,
    refetch,
    setFilters 
  } = useMembers({ page: 1, pageSize: 20 })

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {members.map(member => (
        <div key={member.id}>
          {member.name} {member.last_name}
        </div>
      ))}
      
      {pagination && (
        <div>
          Página {pagination.currentPage} de {pagination.totalPages}
          <button 
            onClick={() => setFilters({ page: pagination.currentPage + 1 })}
            disabled={!pagination.nextPage}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
```

### useMember(id?: string)

Hook para obtener un miembro específico por ID.

```typescript
function MemberDetailComponent({ memberId }: { memberId: string }) {
  const { member, loading, error, refetch } = useMember(memberId)

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!member) return <div>Miembro no encontrado</div>

  return (
    <div>
      <h2>{member.name} {member.last_name}</h2>
      <p>DNI: {member.dni_user}</p>
      <p>Estado: {member.status}</p>
      <button onClick={refetch}>Recargar</button>
    </div>
  )
}
```

### useMemberByDni(dni?: string)

Hook para obtener un miembro por DNI.

```typescript
function SearchByDniComponent() {
  const [dni, setDni] = useState("")
  const [searchDni, setSearchDni] = useState<string>()
  const { member, loading, error } = useMemberByDni(searchDni)

  const handleSearch = () => {
    setSearchDni(dni)
  }

  return (
    <div>
      <input 
        value={dni} 
        onChange={(e) => setDni(e.target.value)} 
        placeholder="Ingrese DNI"
      />
      <button onClick={handleSearch}>Buscar</button>
      
      {loading && <div>Buscando...</div>}
      {error && <div>Error: {error.message}</div>}
      {member && (
        <div>
          <h3>{member.name} {member.last_name}</h3>
          <p>Email: {member.user_email}</p>
        </div>
      )}
    </div>
  )
}
```

### useMemberByUserId(userId?: string)

Hook para obtener un miembro por User ID.

```typescript
function MemberByUserComponent({ userId }: { userId: string }) {
  const { member, loading, error } = useMemberByUserId(userId)

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!member) return <div>Este usuario no tiene un perfil de miembro</div>

  return (
    <div>
      <h3>Perfil de Miembro</h3>
      <p>{member.name} {member.last_name}</p>
      <p>Total ministerios: {member.total_ministries}</p>
      <p>Eventos asistidos: {member.total_events_attended}</p>
    </div>
  )
}
```

### useMemberStats()

Hook para obtener estadísticas de miembros.

```typescript
function StatsComponent() {
  const { stats, loading, error, refetch } = useMemberStats()

  if (loading) return <div>Cargando estadísticas...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!stats) return null

  return (
    <div>
      <h2>Estadísticas de Miembros</h2>
      <div>
        <h3>Total: {stats.total_members}</h3>
        <ul>
          <li>Activos: {stats.activo_count}</li>
          <li>Asistentes: {stats.asistente_count}</li>
          <li>Inactivos: {stats.inactivo_count}</li>
        </ul>
      </div>
      <div>
        <h3>Por Género</h3>
        <ul>
          <li>Masculino: {stats.masculino_count}</li>
          <li>Femenino: {stats.femenino_count}</li>
        </ul>
      </div>
      <div>
        <h3>Por Tipo de Documento</h3>
        <ul>
          <li>CC: {stats.cc_count}</li>
          <li>TI: {stats.ti_count}</li>
          <li>RC: {stats.rc_count}</li>
          <li>PP: {stats.pp_count}</li>
          <li>CE: {stats.ce_count}</li>
          <li>PEP: {stats.pep_count}</li>
          <li>DNI: {stats.dni_count}</li>
        </ul>
      </div>
      <button onClick={refetch}>Actualizar</button>
    </div>
  )
}
```

## Ejemplos de Uso

### Crear un Nuevo Miembro

```typescript
import { membersService } from "@/modules/members"

async function handleCreateMember(formData: CreateMemberData) {
  try {
    const newMember = await membersService.createMember(formData)
    console.log("Miembro creado:", newMember)
    // ✅ Toast de éxito se muestra automáticamente
  } catch (error) {
    // ❌ Toast de error se muestra automáticamente
    console.error("Error al crear miembro:", error)
  }
}
```

### Filtrar Miembros Activos con Paginación

```typescript
import { useMembers } from "@/modules/members"

function ActiveMembersList() {
  const { members, loading, pagination, setFilters } = useMembers({
    status: "ACTIVO",
    page: 1,
    pageSize: 20
  })

  const goToNextPage = () => {
    if (pagination?.nextPage) {
      setFilters({ status: "ACTIVO", page: pagination.nextPage, pageSize: 20 })
    }
  }

  const goToPreviousPage = () => {
    if (pagination?.previousPage) {
      setFilters({ status: "ACTIVO", page: pagination.previousPage, pageSize: 20 })
    }
  }

  return (
    <div>
      <h2>Miembros Activos</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <ul>
            {members.map(member => (
              <li key={member.id}>
                {member.name} {member.last_name} - {member.cell}
              </li>
            ))}
          </ul>
          
          {pagination && (
            <div>
              <button 
                onClick={goToPreviousPage} 
                disabled={!pagination.previousPage}
              >
                Anterior
              </button>
              <span>
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={!pagination.nextPage}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

### Buscar Miembros por Nombre

```typescript
import { useState } from "react"
import { useMembers } from "@/modules/members"

function SearchMembers() {
  const [searchTerm, setSearchTerm] = useState("")
  const { members, loading, setFilters } = useMembers()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim().length >= 2) {
      setFilters({ search: searchTerm })
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setFilters({})
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o apellido..."
          minLength={2}
        />
        <button type="submit">Buscar</button>
        <button type="button" onClick={handleClearSearch}>
          Limpiar
        </button>
      </form>

      {loading ? (
        <div>Buscando...</div>
      ) : (
        <ul>
          {members.map(member => (
            <li key={member.id}>
              {member.name} {member.last_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Actualizar Estado de un Miembro

```typescript
import { membersService } from "@/modules/members"

async function updateMemberStatus(memberId: string, newStatus: MemberStatus) {
  try {
    const updated = await membersService.updateMember(memberId, {
      status: newStatus
    })
    console.log("Estado actualizado:", updated.status)
    // ✅ Toast de éxito se muestra automáticamente
    return updated
  } catch (error) {
    // ❌ Toast de error se muestra automáticamente
    console.error("Error al actualizar estado:", error)
    throw error
  }
}
```

### Eliminar un Miembro

```typescript
import { membersService } from "@/modules/members"

async function handleDeleteMember(memberId: string) {
  if (confirm("¿Estás seguro de que deseas eliminar este miembro?")) {
    try {
      await membersService.deleteMember(memberId)
      console.log("Miembro eliminado")
      // ✅ Toast de éxito se muestra automáticamente
    } catch (error) {
      // ❌ Toast de error se muestra automáticamente
      console.error("Error al eliminar miembro:", error)
    }
  }
}
```

## Enums Disponibles

### MemberStatus
```typescript
type MemberStatus = "ACTIVO" | "ASISTENTE" | "INACTIVO"
```

### Gender
```typescript
type Gender = "MASCULINO" | "FEMENINO"
```

### DocumentType
```typescript
type DocumentType = "CC" | "TI" | "RC" | "PP" | "CE" | "PEP" | "DNI"
```

## Notas Importantes

1. **Autenticación**: Todas las peticiones requieren autenticación (token JWT)
2. **Mensajes automáticos**: Los toasts de éxito/error se muestran automáticamente
3. **Paginación**: Por defecto, la API retorna 20 registros por página
4. **Soft Delete**: La eliminación de miembros es lógica (soft delete)
5. **Validaciones**: El backend valida todos los datos según el schema de Swagger
6. **Fechas**: Las fechas deben estar en formato ISO 8601 (YYYY-MM-DD)

## Variables de Entorno

Asegúrate de tener configurada la URL del backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

