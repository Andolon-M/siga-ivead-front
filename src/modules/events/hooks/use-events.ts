import { useState, useEffect } from "react"
import type { Event } from "../types"
import { eventsService } from "../services/events.service"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await eventsService.getAllEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar eventos"))
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
    error,
    refetch: loadEvents,
  }
}

