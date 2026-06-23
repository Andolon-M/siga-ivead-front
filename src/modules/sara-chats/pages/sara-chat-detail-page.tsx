import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Bot,
  Smartphone,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { MessageBubble } from "../components/message-bubble"
import { useSaraChatMessages } from "../hooks/use-sara-chats"

export function SaraChatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [limit] = useState(50)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevScrollHeight = useRef<number>(0)

  const { data, messages, pagination, isLoading, isFetchingMore, error, refetch, loadMore } = useSaraChatMessages(
    id ?? "",
    { limit }
  )

  const chat = data?.chat
  const memberName = [chat?.member?.name, chat?.member?.last_name].filter(Boolean).join(" ") || "Sin nombre"
  const phone = chat?.member?.cell || "—"

  const platformIcon = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return <Smartphone className="h-3.5 w-3.5" />
      case "telegram":
        return <Send className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  // Reverse messages so oldest are at top (API returns newest first)
  const sortedMessages = [...messages].reverse()

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      // Guardar la altura actual antes de que se añadan nuevos mensajes arriba
      prevScrollHeight.current = e.currentTarget.scrollHeight
      loadMore()
    }
  }

  // Auto-scroll al fondo inicial o ajuste de scroll al cargar más (hacia arriba)
  useLayoutEffect(() => {
    if (!scrollRef.current) return
    
    if (pagination.page === 1) {
      // Si es la página 1 (carga inicial o recarga), vamos al fondo
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    } else if (prevScrollHeight.current > 0) {
      // Si cargamos más, ajustamos el scroll para mantener la posición visual
      const diff = scrollRef.current.scrollHeight - prevScrollHeight.current
      scrollRef.current.scrollTop = diff
      prevScrollHeight.current = 0
    }
  }, [sortedMessages.length, pagination.page])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b bg-card px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/sara/chats")} className="shrink-0 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {chat ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
              {(chat.member?.name?.[0] ?? "?").toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">{memberName}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{phone}</span>
                {chat.platforms?.map((p) => (
                  <span
                    key={p.id}
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      p.platform === "whatsapp"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {platformIcon(p.platform)}
                    {p.platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded mt-1" />
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-amber-500/10 px-2 py-1 rounded-full">
            <Eye className="h-3 w-3" />
            <span>Solo lectura</span>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] dark:bg-[#0b141a]"
      >
        {isFetchingMore && (
          <div className="py-2 flex justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col max-w-[70%]",
                  i % 2 === 0 ? "self-start" : "self-end"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl animate-pulse bg-muted/50",
                    i % 2 === 0 ? "w-64 h-16 rounded-tl-sm" : "w-48 h-12 rounded-tr-sm"
                  )}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Error al cargar mensajes</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Sin mensajes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Este chat aún no tiene mensajes registrados en el historial.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="shrink-0 border-t bg-card px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          Los mensajes se muestran en modo de solo lectura · No es posible enviar mensajes desde este panel
        </p>
      </div>
    </div>
  )
}
