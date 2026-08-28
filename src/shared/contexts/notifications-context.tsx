import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useSocketConnection, useSocketEvent } from "@/shared/hooks/use-socket"

const STORAGE_KEY = "admin-notifications-v1"
const MAX_NOTIFICATIONS = 100

type NotificationType = "info" | "success" | "warning" | "error"

type NotificationSource = "mass_messaging" | "system"

interface NotificationEvent {
  id: string
  source: NotificationSource
  event: string
  type: NotificationType
  title: string
  message: string
  requestId?: string
  createdAt: string
  read: boolean
}

interface NotificationsContextValue {
  notifications: NotificationEvent[]
  unreadCount: number
  socketConnected: boolean
  addNotification: (notification: Omit<NotificationEvent, "id" | "createdAt" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

interface MassMessageSocketPayload {
  requestId?: string
  phone?: string
  templateId?: string
  templateName?: string
  totalRecipients?: number
  error?: string
  summary?: {
    sent?: number
    failed?: number
    total?: number
    completed?: number
  }
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

function parseStoredNotifications(): NotificationEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as NotificationEvent[]
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_NOTIFICATIONS)
  } catch {
    return []
  }
}

function buildNotificationFromMassEvent(eventName: string, payload: MassMessageSocketPayload) {
  const requestId = payload.requestId
  switch (eventName) {
    case "mass_message.queued":
      return {
        source: "mass_messaging" as const,
        event: eventName,
        type: "info" as const,
        title: "Campaña iniciada",
        message: payload.templateName
          ? `Campaña "${payload.templateName}" encolada para ${payload.totalRecipients ?? 0} destinatarios.`
          : `Campaña encolada para ${payload.totalRecipients ?? 0} destinatarios (request ${requestId ?? "N/A"}).`,
        requestId,
      }
    case "mass_message.completed":
      return {
        source: "mass_messaging" as const,
        event: eventName,
        type: "success" as const,
        title: "Campaña completada",
        message: `Campaña finalizada: ${payload.summary?.sent ?? 0} enviados exitosamente, ${payload.summary?.failed ?? 0} fallidos.`,
        requestId,
      }
    default:
      return null
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>(() => parseStoredNotifications())
  const [socketConnected, setSocketConnected] = useState(false)

  useSocketConnection((connected) => {
    setSocketConnected(connected)
  })

  const addNotification = useCallback((notification: Omit<NotificationEvent, "id" | "createdAt" | "read">) => {
    setNotifications((current) => {
      // Evitar duplicados consecutivos del mismo evento para el mismo requestId
      if (notification.requestId) {
        const isDuplicate = current.some(
          (item) =>
            item.requestId === notification.requestId &&
            item.event === notification.event &&
            Date.now() - new Date(item.createdAt).getTime() < 10000
        )
        if (isDuplicate) return current
      }

      const nextItem: NotificationEvent = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        read: false,
      }
      return [nextItem, ...current].slice(0, MAX_NOTIFICATIONS)
    })
  }, [])

  useSocketEvent<MassMessageSocketPayload>("mass_message.queued", (payload) => {
    const notification = buildNotificationFromMassEvent("mass_message.queued", payload)
    if (notification) addNotification(notification)
  })

  useSocketEvent<MassMessageSocketPayload>("mass_message.completed", (payload) => {
    const notification = buildNotificationFromMassEvent("mass_message.completed", payload)
    if (notification) addNotification(notification)
  })

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      socketConnected,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }),
    [notifications, unreadCount, socketConnected, addNotification, markAsRead, markAllAsRead, clearNotifications]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider")
  }
  return context
}

export type { NotificationEvent, NotificationType, NotificationSource }

