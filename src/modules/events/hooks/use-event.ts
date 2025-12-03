import { useState, useEffect } from "react"
import type { Event } from "../types"
import { eventsService } from "../services/events.service"

export function useEvent(eventId: number) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const data = await eventsService.getEventById(eventId)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar el evento"))
    } finally {
      setLoading(false)
    }
  }

  return {
    event,
    loading,
    error,
    refetch: loadEvent,
  }
}

