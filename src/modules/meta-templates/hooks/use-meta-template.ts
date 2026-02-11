import { useCallback, useEffect, useState } from "react"
import { metaTemplatesService } from "../services/meta-templates.service"
import type { MetaTemplate } from "../types"

interface UseMetaTemplateResult {
  template: MetaTemplate | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMetaTemplate(templateId?: string): UseMetaTemplateResult {
  const [template, setTemplate] = useState<MetaTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!templateId) return
    try {
      setLoading(true)
      setError(null)
      const data = await metaTemplatesService.getTemplateById(templateId)
      setTemplate(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("No se pudo obtener la plantilla"))
      setTemplate(null)
    } finally {
      setLoading(false)
    }
  }, [templateId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    template,
    loading,
    error,
    refetch: load,
  }
}

