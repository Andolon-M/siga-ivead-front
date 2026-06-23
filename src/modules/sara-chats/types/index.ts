/**
 * Tipos para el módulo de chats administrativos de Sara.
 */

/** Información de un miembro vinculado a un chat */
export interface SaraChatMember {
  id: string
  name: string | null
  last_name: string | null
  cell: string | null
  status: string | null
}

/** Plataforma vinculada a un chat */
export interface SaraChatPlatform {
  id: string
  platform: string
  platform_id: string
  verified: boolean
}

/** Chat en la lista */
export interface SaraChat {
  id: string
  member_id: string
  last_platform: string | null
  last_message_at: string | null
  created_at: string | null
  member: SaraChatMember
  platforms: SaraChatPlatform[]
}

/** Paginación */
export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Respuesta de lista de chats */
export interface SaraChatsListResponse {
  chats: SaraChat[]
  pagination: Pagination
}

/** Mensaje individual del chat (de PostgreSQL) */
export interface SaraChatMessage {
  id: number
  session_id: string
  message: {
    type: 'human' | 'ai'
    content: string
    additional_kwargs?: Record<string, unknown>
  }
  created_at?: string
}

/** Respuesta de mensajes de un chat */
export interface SaraChatMessagesResponse {
  chat: {
    id: string
    member: SaraChatMember
    platforms: SaraChatPlatform[]
    last_platform: string | null
    last_message_at: string | null
  }
  messages: SaraChatMessage[]
  pagination: Pagination
}
