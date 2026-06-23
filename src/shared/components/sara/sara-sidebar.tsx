import { Link, useLocation } from "react-router-dom"
import { cn } from "@/shared/lib/utils"
import {
  MessageSquare,
  Send,
  FileText,
  X,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const saraMenuItems = [
  {
    title: "Chats",
    href: "/admin/sara/chats",
    icon: MessageSquare,
    description: "Conversaciones con la IA",
  },
  {
    title: "Mensajería Masiva",
    href: "/admin/sara/mass-messaging",
    icon: Send,
    description: "Envío masivo de mensajes",
  },
  {
    title: "Plantillas Meta",
    href: "/admin/sara/meta-templates",
    icon: FileText,
    description: "Plantillas de WhatsApp",
  },
]

interface SaraSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SaraSidebar({ isOpen = true, onClose }: SaraSidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-card border-r flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/Sara%20perfil%20cuadrado.png" 
              alt="SARA AI" 
              className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-border/50" 
            />
            <div>
              <h2 className="font-bold text-lg">SARA</h2>
              <p className="text-xs text-muted-foreground">Agente IA</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Back to Admin */}
        <div className="px-4 pt-4 pb-2">
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al Panel Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {saraMenuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <span className="truncate block">{item.title}</span>
                  {isActive && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema activo</span>
          </div>
        </div>
      </aside>
    </>
  )
}
