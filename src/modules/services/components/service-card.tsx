import { Church, Calendar, Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatTimeFromISO, extractDateOnly } from "@/shared/lib/date-utils"
import { cn } from "@/shared/lib/utils"
import type { MeetingSession } from "../types"

interface ServiceCardProps {
  session: MeetingSession
  onClick?: () => void
  className?: string
}

export function ServiceCard({ session, onClick, className }: ServiceCardProps) {
  const meeting = session.recurring_meeting
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
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {meeting?.name ?? "Sin nombre"}
              </h3>
              <div className="flex gap-1 shrink-0">
                <Badge variant="secondary" className="text-xs">
                  servicio
                </Badge>
                {meeting?.name && (
                  <Badge variant="outline" className="text-xs">
                    {meeting.name.split(" ")[0]}
                  </Badge>
                )}
              </div>
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
          </div>

          {/* Indicadores de roles (círculos de colores como en el diseño) */}
          <div className="flex shrink-0 flex-col gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full",
                  i === 1 && "bg-blue-500",
                  i === 2 && "bg-violet-500",
                  i === 3 && "bg-rose-500",
                  i === 4 && "bg-orange-500",
                  i === 5 && "bg-amber-500"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
