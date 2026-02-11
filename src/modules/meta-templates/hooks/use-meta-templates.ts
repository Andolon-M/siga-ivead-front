import { useCallback, useEffect, useMemo, useState } from "react"
import { metaTemplatesService } from "../services/meta-templates.service"
import type { MetaTemplate, MetaTemplateFilters } from "../types"

interface UseMetaTemplatesResult {
  templates: MetaTemplate[]
  total: number
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMetaTemplates(filters?: MetaTemplateFilters): UseMetaTemplatesResult {
  const [templates, setTemplates] = useState<MetaTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await metaTemplatesService.listTemplates()
      setTemplates(data.templates ?? [])
      setTotal(data.total ?? data.templates?.length ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("No se pudieron cargar las plantillas"))
      setTemplates([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredTemplates = useMemo(() => {
    const search = filters?.search?.trim().toLowerCase()
    const category = filters?.category
    const status = filters?.status

    return templates.filter((template) => {
      const matchSearch = !search
        || template.name.toLowerCase().includes(search)
        || template.id.toLowerCase().includes(search)
        || template.language.toLowerCase().includes(search)

      const matchCategory = !category || category === "all" || template.category === category
      const matchStatus = !status || status === "all" || template.status === status
      return matchSearch && matchCategory && matchStatus
    })
  }, [templates, filters?.search, filters?.category, filters?.status])

  return {
    templates: filteredTemplates,
    total,
    loading,
    error,
    refetch: load,
  }
}

