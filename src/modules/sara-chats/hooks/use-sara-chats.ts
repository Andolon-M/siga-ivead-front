import { useState, useEffect, useCallback } from "react"
import { saraChatsService } from "../services/sara-chats.service"
import type {
  SaraChat,
  Pagination,
  SaraChatMessage,
  SaraChatMessagesResponse,
} from "../types"

/**
 * Hook para obtener la lista paginada de chats de Sara.
 */
export function useSaraChats(params?: { search?: string; limit?: number }) {
  const [chats, setChats] = useState<SaraChat[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: params?.limit ?? 20,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = useCallback(async (currentPage: number, isLoadMore = false) => {
    if (isLoadMore) setIsFetchingMore(true)
    else setIsLoading(true)
    setError(null)
    try {
      const data = await saraChatsService.getChats({
        page: currentPage,
        limit: params?.limit ?? 20,
        search: params?.search || undefined,
      })
      if (isLoadMore) {
        setChats(prev => [...prev, ...data.chats])
      } else {
        setChats(data.chats)
      }
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching Sara chats:", err)
      setError("Error al cargar los chats")
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [params?.limit, params?.search])

  useEffect(() => {
    setPage(1)
    fetchChats(1, false)
  }, [fetchChats, params?.search])

  const loadMore = useCallback(() => {
    if (!isLoading && !isFetchingMore && page < pagination.totalPages) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchChats(nextPage, true)
    }
  }, [isLoading, isFetchingMore, page, pagination.totalPages, fetchChats])

  return { chats, pagination, isLoading, isFetchingMore, error, refetch: () => fetchChats(1, false), loadMore }
}

/**
 * Hook para obtener los mensajes de un chat específico.
 */
export function useSaraChatMessages(chatId: string, params?: { limit?: number }) {
  const [data, setData] = useState<SaraChatMessagesResponse | null>(null)
  const [messages, setMessages] = useState<SaraChatMessage[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: params?.limit ?? 50,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async (currentPage: number, isLoadMore = false) => {
    if (!chatId) return
    if (isLoadMore) setIsFetchingMore(true)
    else setIsLoading(true)
    setError(null)
    try {
      const result = await saraChatsService.getChatMessages(chatId, {
        page: currentPage,
        limit: params?.limit ?? 50,
      })
      if (currentPage === 1) {
        setData(result)
        setMessages(result.messages)
      } else {
        setMessages(prev => [...prev, ...result.messages])
      }
      setPagination(result.pagination)
    } catch (err) {
      console.error("Error fetching chat messages:", err)
      setError("Error al cargar los mensajes")
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [chatId, params?.limit])

  useEffect(() => {
    setPage(1)
    fetchMessages(1, false)
  }, [fetchMessages])

  const loadMore = useCallback(() => {
    if (!isLoading && !isFetchingMore && page < pagination.totalPages) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchMessages(nextPage, true)
    }
  }, [isLoading, isFetchingMore, page, pagination.totalPages, fetchMessages])

  return { data, messages, pagination, isLoading, isFetchingMore, error, refetch: () => fetchMessages(1, false), loadMore }
}
