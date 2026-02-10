import { useCallback, useEffect, useMemo, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { Loader2, Plus, RefreshCw, Send, Trash2 } from "lucide-react"
import type { Gender, MemberStatus } from "@/modules/members/types"
import { useMembers } from "@/modules/members/hooks/use-members"
import { SearchInput } from "@/shared/components/search-input"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Progress } from "@/shared/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { useMetaTemplates } from "../hooks/use-meta-templates"
import { dedupeRecipients, isTemplatePersonalizableByMessage, normalizePhone } from "../hooks/mass-messaging.utils"
import { massMessagingService } from "../services/mass-messaging.service"
import { ManualRecipientDialog } from "../components/manual-recipient-dialog"
import { RecipientMembersTable } from "../components/recipient-members-table"
import type { CampaignStatusSummary, ManualRecipientForm, RecipientViewModel } from "../types"

const MEMBER_STATUSES: MemberStatus[] = ["ACTIVO", "ASISTENTE", "INACTIVO", "VISITANTE"]
const GENDERS: Gender[] = ["MASCULINO", "FEMENINO"]

function resolveSocketBaseUrl(): string {
  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "")
  return apiBaseUrl.replace(/\/api\/?$/, "")
}

export function MassMessagingPage() {
  const { templates, loading: templatesLoading, error: templatesError, refetch: refetchTemplates } = useMetaTemplates()

  const [templateId, setTemplateId] = useState<string>("")
  const [manualDialogOpen, setManualDialogOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [audienceMode, setAudienceMode] = useState<"all" | "status" | "gender">("all")
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all")
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const [selectedMembersMap, setSelectedMembersMap] = useState<Record<string, RecipientViewModel>>({})
  const [manualRecipients, setManualRecipients] = useState<RecipientViewModel[]>([])

  const [isSending, setIsSending] = useState(false)
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null)
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatusSummary | null>(null)
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templates, templateId]
  )
  const personalize = isTemplatePersonalizableByMessage(selectedTemplate) ? 1 : 0

  const memberFilters = useMemo(() => {
    const filters: {
      search?: string
      status?: MemberStatus
      gender?: Gender
      page: number
      pageSize: number
    } = {
      search: searchQuery || undefined,
      page: currentPage,
      pageSize,
    }

    if (audienceMode === "status" && statusFilter !== "all") {
      filters.status = statusFilter
    }
    if (audienceMode === "gender" && genderFilter !== "all") {
      filters.gender = genderFilter
    }

    return filters
  }, [audienceMode, currentPage, genderFilter, pageSize, searchQuery, statusFilter])

  const { members, loading: membersLoading, pagination, refetch: refetchMembers } = useMembers(memberFilters)

  const selectedRecipients = useMemo(
    () => [...Object.values(selectedMembersMap), ...manualRecipients],
    [selectedMembersMap, manualRecipients]
  )

  const uniqueRecipientsPreview = useMemo(
    () => dedupeRecipients(selectedRecipients, personalize),
    [personalize, selectedRecipients]
  )

  const progressPercentage = useMemo(() => {
    if (!campaignStatus || campaignStatus.total === 0) return 0
    return Math.round((campaignStatus.completed / campaignStatus.total) * 100)
  }, [campaignStatus])

  const refreshCampaignStatus = useCallback(async (requestId: string) => {
    try {
      setIsRefreshingStatus(true)
      const status = await massMessagingService.getRequestStatus(requestId)
      setCampaignStatus(status)
    } catch (error) {
      console.error("No se pudo consultar estado de la campaña:", error)
    } finally {
      setIsRefreshingStatus(false)
    }
  }, [])

  const handleToggleMember = (memberId: string, checked: boolean) => {
    const member = members.find((item) => item.id === memberId)
    if (!member || !member.cell) return

    setSelectedMembersMap((current) => {
      if (!checked) {
        const copy = { ...current }
        delete copy[memberId]
        return copy
      }
      return {
        ...current,
        [memberId]: {
          key: `member-${memberId}`,
          source: "member",
          memberId,
          name: `${member.name} ${member.last_name}`.trim(),
          phone: normalizePhone(member.cell),
          note: current[memberId]?.note ?? "",
        },
      }
    })
  }

  const handleToggleAllPage = (checked: boolean) => {
    const membersWithPhone = members.filter((member) => !!member.cell)
    setSelectedMembersMap((current) => {
      const next = { ...current }

      membersWithPhone.forEach((member) => {
        if (!checked) {
          delete next[member.id]
          return
        }
        next[member.id] = {
          key: `member-${member.id}`,
          source: "member",
          memberId: member.id,
          name: `${member.name} ${member.last_name}`.trim(),
          phone: normalizePhone(member.cell),
          note: current[member.id]?.note ?? "",
        }
      })

      return next
    })
  }

  const handleAddManualRecipient = (recipient: ManualRecipientForm) => {
    setManualRecipients((current) => [
      ...current,
      {
        key: `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        source: "manual",
        name: recipient.name,
        phone: normalizePhone(recipient.phone),
        note: recipient.note,
      },
    ])
  }

  const handleRemoveRecipient = (recipient: RecipientViewModel) => {
    if (recipient.source === "member" && recipient.memberId) {
      setSelectedMembersMap((current) => {
        const copy = { ...current }
        delete copy[recipient.memberId as string]
        return copy
      })
      return
    }
    setManualRecipients((current) => current.filter((item) => item.key !== recipient.key))
  }

  const handleRecipientNoteChange = (recipient: RecipientViewModel, note: string) => {
    if (recipient.source === "member" && recipient.memberId) {
      setSelectedMembersMap((current) => ({
        ...current,
        [recipient.memberId as string]: {
          ...current[recipient.memberId as string],
          note,
        },
      }))
      return
    }
    setManualRecipients((current) =>
      current.map((item) => (item.key === recipient.key ? { ...item, note } : item))
    )
  }

  const handleSendCampaign = async () => {
    if (!selectedTemplate) {
      alert("Selecciona una plantilla para continuar")
      return
    }

    const dedupedRecipients = dedupeRecipients(selectedRecipients, personalize)
    if (dedupedRecipients.length === 0) {
      alert("Debes seleccionar al menos un destinatario válido")
      return
    }

    try {
      setIsSending(true)
      const response = await massMessagingService.sendTemplate({
        templateId: selectedTemplate.id,
        personalize,
        recipients: dedupedRecipients,
      })

      setActiveRequestId(response.requestId)
      setCampaignStatus({
        requestId: response.requestId,
        templateId: selectedTemplate.id,
        status: "queued",
        total: response.totalRecipients,
        queued: response.totalRecipients,
        processing: 0,
        sent: 0,
        failed: 0,
        completed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      await refreshCampaignStatus(response.requestId)
    } catch (error) {
      console.error("No se pudo encolar la campaña:", error)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (!activeRequestId) return

    const socketBaseUrl = resolveSocketBaseUrl()
    let mounted = true
    const socket: Socket = io(socketBaseUrl, { withCredentials: true })

    socket.on("connect", () => {
      if (!mounted) return
      setSocketConnected(true)
      socket.emit("mass_message:subscribe", activeRequestId)
    })

    socket.on("disconnect", () => {
      if (!mounted) return
      setSocketConnected(false)
    })

    const events = [
      "mass_message.queued",
      "mass_message.processing",
      "mass_message.sent",
      "mass_message.failed",
      "mass_message.completed",
    ]

    events.forEach((eventName) => {
      socket.on(eventName, (payload: { requestId?: string }) => {
        if (payload?.requestId !== activeRequestId) return
        void refreshCampaignStatus(activeRequestId)
      })
    })

    return () => {
      mounted = false
      socket.emit("mass_message:unsubscribe", activeRequestId)
      socket.disconnect()
    }
  }, [activeRequestId, refreshCampaignStatus])

  useEffect(() => {
    if (!activeRequestId) return
    if (campaignStatus?.status === "completed") return

    const interval = window.setInterval(() => {
      void refreshCampaignStatus(activeRequestId)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [activeRequestId, campaignStatus?.status, refreshCampaignStatus])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mensajería Masiva</h1>
          <p className="text-muted-foreground">Envía campañas por WhatsApp con plantillas de Meta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1) Seleccionar plantilla</CardTitle>
          <CardDescription>Solo plantillas APPROVED están disponibles para envío</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templatesLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando plantillas...
            </div>
          ) : null}

          {templatesError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">No se pudieron obtener las plantillas de Meta.</p>
              <Button variant="outline" size="sm" onClick={refetchTemplates}>
                Reintentar
              </Button>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Plantilla</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.language})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate ? (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant={selectedTemplate.status === "APPROVED" ? "default" : "secondary"}>
                  {selectedTemplate.status}
                </Badge>
                <Badge variant={personalize === 1 ? "default" : "secondary"}>
                  personalize: {personalize}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {personalize === 1
                  ? "La plantilla incluye variable 'message'; se habilitan notas para personalización."
                  : "La plantilla no tiene variable 'message'; se enviará con personalize=0."}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2) Seleccionar destinatarios</CardTitle>
          <CardDescription>
            Filtra miembros por estado o género. La opción “seleccionar todos” aplica a la página visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <SearchInput
                onSearch={(query) => {
                  setCurrentPage(1)
                  setSearchQuery(query)
                }}
                placeholder="Buscar miembros..."
                isSearching={membersLoading}
              />
            </div>

            <Select
              value={audienceMode}
              onValueChange={(value: "all" | "status" | "gender") => {
                setCurrentPage(1)
                setAudienceMode(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="status">Filtrar por estado</SelectItem>
                <SelectItem value="gender">Filtrar por género</SelectItem>
              </SelectContent>
            </Select>

            {audienceMode === "status" ? (
              <Select
                value={statusFilter}
                onValueChange={(value: MemberStatus | "all") => {
                  setCurrentPage(1)
                  setStatusFilter(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {MEMBER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {audienceMode === "gender" ? (
              <Select
                value={genderFilter}
                onValueChange={(value: Gender | "all") => {
                  setCurrentPage(1)
                  setGenderFilter(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los géneros</SelectItem>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Seleccionados desde miembros: {Object.keys(selectedMembersMap).length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => void refetchMembers()} disabled={membersLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button size="sm" onClick={() => setManualDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar manual
              </Button>
            </div>
          </div>

          <RecipientMembersTable
            members={members}
            selectedIds={Object.keys(selectedMembersMap)}
            onToggleMember={handleToggleMember}
            onToggleAllPage={handleToggleAllPage}
          />

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {pagination.currentPage} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.previousPage || 1)}
                  disabled={!pagination.previousPage || membersLoading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.nextPage || pagination.currentPage)}
                  disabled={!pagination.nextPage || membersLoading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinatarios seleccionados</CardTitle>
          <CardDescription>
            Total seleccionados: {selectedRecipients.length} | Únicos por teléfono: {uniqueRecipientsPreview.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedRecipients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no has seleccionado destinatarios.</p>
          ) : (
            selectedRecipients.map((recipient) => (
              <div key={recipient.key} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{recipient.name || "Sin nombre"}</p>
                    <p className="text-sm text-muted-foreground">{recipient.phone}</p>
                    <Badge variant="outline">{recipient.source === "member" ? "Miembro" : "Manual"}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveRecipient(recipient)} title="Quitar">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {personalize === 1 ? (
                  <div className="space-y-1">
                    <Label className="text-xs">Nota para personalización (opcional)</Label>
                    <Textarea
                      value={recipient.note ?? ""}
                      onChange={(event) => handleRecipientNoteChange(recipient, event.target.value)}
                      rows={2}
                      placeholder="Contexto adicional para el mensaje"
                    />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3) Envío y monitoreo</CardTitle>
          <CardDescription>Monitoreo en tiempo real por WebSocket con respaldo por polling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              onClick={handleSendCampaign}
              disabled={!selectedTemplate || uniqueRecipientsPreview.length === 0 || isSending}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar campaña
            </Button>
            <Badge variant={socketConnected ? "default" : "secondary"}>
              Socket: {socketConnected ? "conectado" : "desconectado"}
            </Badge>
            {activeRequestId ? <Badge variant="outline">requestId: {activeRequestId}</Badge> : null}
            {isRefreshingStatus ? (
              <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Actualizando estado...
              </span>
            ) : null}
          </div>

          {campaignStatus ? (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">estado: {campaignStatus.status}</Badge>
                <Badge variant="outline">total: {campaignStatus.total}</Badge>
                <Badge variant="outline">en cola: {campaignStatus.queued}</Badge>
                <Badge variant="outline">procesando: {campaignStatus.processing}</Badge>
                <Badge variant="outline">enviados: {campaignStatus.sent}</Badge>
                <Badge variant="outline">fallidos: {campaignStatus.failed}</Badge>
              </div>
              <Progress value={progressPercentage} />
              <p className="text-sm text-muted-foreground">Completado: {campaignStatus.completed}/{campaignStatus.total} ({progressPercentage}%)</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeRequestId && void refreshCampaignStatus(activeRequestId)}
                disabled={!activeRequestId}
              >
                Consultar estado ahora
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cuando envíes una campaña verás aquí el estado en tiempo real.
            </p>
          )}
        </CardContent>
      </Card>

      <ManualRecipientDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        allowNote={personalize === 1}
        onSubmit={handleAddManualRecipient}
      />
    </div>
  )
}

