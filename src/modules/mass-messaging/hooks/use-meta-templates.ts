import { useCallback, useEffect, useState } from "react"
import { metaTemplatesService } from "../services/meta-templates.service"
import type { MetaTemplate } from "../types"

interface UseMetaTemplatesResult {
  templates: MetaTemplate[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMetaTemplates(): UseMetaTemplatesResult {
  const [templates, setTemplates] = useState<MetaTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await metaTemplatesService.listTemplates()
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("No se pudieron obtener las plantillas"))
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return { templates, loading, error, refetch: loadTemplates }
}

