import { Church, Calendar, Clock, MapPin, Wheat, SignpostBig, Badge } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatTimeFromISO, extractDateOnly } from "@/shared/lib/date-utils"
import { cn } from "@/shared/lib/utils"
import type { MeetingSession, SessionStatus } from "../types"

const SESSION_STATUS_ORDER: SessionStatus[] = ["PLANIFICADO", "ACTIVO", "FINALIZADO", "CANCELADO"]

const STATUS_STYLES: Record<SessionStatus, string> = {
  PLANIFICADO: "bg-primary",
  ACTIVO: "bg-emerald-500",
  FINALIZADO: "bg-muted-foreground",
  CANCELADO: "bg-destructive",
}

interface ServiceCardProps {
  session: MeetingSession
  onClick?: () => void
  className?: string
}

export function ServiceCard({ session, onClick, className }: ServiceCardProps) {
  const meeting = session.recurring_meetings
  const location = session.actual_location || meeting?.location || "Sin ubicación"
  const dateStr = extractDateOnly(session.session_date)
  const timeStr = formatTimeFromISO(session.start_time)

  // Formatear fecha para mostrar (ej: "21 feb")
  const formattedDate = dateStr
    ? format(new Date(dateStr + "T12:00:00"), "d MMM", { locale: es })
    : ""

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icono */}
          <div className="flex shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Church className="h-5 w-5 text-primary" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {meeting?.name ?? "Sin nombre"} <span className="text-primary">{session.is_santa_cena ? "Santa Cena" : ""}</span>
              </h3>
              {session.is_santa_cena && (
                <span className="flex items-center gap-1.5 text-primary" title="Santa Cena">
                  <SignpostBig className="h-4 w-4" />
                  <Wheat className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{timeStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
            {/* Indicadores de estado: PLANIFICADO | ACTIVO | FINALIZADO | CANCELADO */}
            <div className="flex pl-1 shrink-0 gap-1 justify-start" title={session.status}>
              {SESSION_STATUS_ORDER.map((status) => {
                const isActive = session.status === status
                return (
                  <div
                    key={status}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      isActive ? STATUS_STYLES[status] : "bg-muted"
                    )}
                    title={status}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
