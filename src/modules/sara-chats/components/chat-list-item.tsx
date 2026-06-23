import { cn } from "@/shared/lib/utils"
import { MessageSquare, Smartphone, Send } from "lucide-react"
import type { SaraChat } from "../types"

interface ChatListItemProps {
  chat: SaraChat
  onClick?: () => void
  isActive?: boolean
}

export function ChatListItem({ chat, onClick, isActive }: ChatListItemProps) {
  const memberName = [chat.member?.name, chat.member?.last_name].filter(Boolean).join(" ") || "Sin nombre"
  const phone = chat.member?.cell || "Sin teléfono"
  const lastPlatform = chat.last_platform || "—"
  const lastMessage = chat.last_message_at
    ? new Date(chat.last_message_at).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sin actividad"

  const statusColors: Record<string, string> = {
    VISITANTE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ASISTENTE: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    ACTIVO: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    INACTIVO: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400",
  }
  const statusClass = statusColors[chat.member?.status ?? ""] ?? statusColors.INACTIVO

  const platformIcon = lastPlatform === "whatsapp" ? (
    <Smartphone className="h-3.5 w-3.5" />
  ) : lastPlatform === "telegram" ? (
    <Send className="h-3.5 w-3.5" />
  ) : (
    <MessageSquare className="h-3.5 w-3.5" />
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:border-primary/30 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "group cursor-pointer",
        isActive
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {(chat.member?.name?.[0] ?? "?").toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground truncate">
              {memberName}
            </span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", statusClass)}>
              {chat.member?.status ?? "—"}
            </span>
          </div>

          {/* Phone */}
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{phone}</p>

          {/* Bottom row: platform + date */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {platformIcon}
              <span className="capitalize">{lastPlatform}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{lastMessage}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
