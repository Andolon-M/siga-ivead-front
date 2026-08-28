import { Link, useLocation } from "react-router-dom"
import { cn } from "@/shared/lib/utils"
import {
  Users,
  UserCircle,
  Church,
  Calendar,
  CalendarDays,
  FileText,
  DollarSign,
  LayoutDashboard,
  Shield,
  HandHeart,
  X,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const SaraIcon = ({ className }: { className?: string }) => (
  <img
    src="/Sara%20perfil%20cuadrado.png"
    alt="Sara"
    className={cn("w-5 h-5 rounded-md object-cover", className)}
  />
)

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  label?: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    items: [
      {
        title: "Inicio",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "IVE",
    items: [
      {
        title: "Miembros",
        href: "/admin/members",
        icon: UserCircle,
      },
      {
        title: "Ministerios",
        href: "/admin/ministries",
        icon: Church,
      },
      {
        title: "Cultos",
        href: "/admin/services",
        icon: CalendarDays,
      },
      {
        title: "Voluntarios",
        href: "/admin/volunteers",
        icon: HandHeart,
      },
      {
        title: "Eventos",
        href: "/admin/events",
        icon: Calendar,
      },
      {
        title: "Archivos",
        href: "/admin/files",
        icon: FileText,
      },
    ],
  },
  {
    label: "Agente IA",
    items: [
      {
        title: "SARA",
        href: "/admin/sara",
        icon: SaraIcon,
      },
    ],
  },
  {
    label: "Finanzas",
    items: [
      {
        title: "Reportes Financieros",
        href: "/admin/reports",
        icon: DollarSign,
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      {
        title: "Usuarios",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Roles y Permisos",
        href: "/admin/roles",
        icon: Shield,
      },
    ],
  },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-card border-r flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/images/logo-ive-color.png" alt="IVE Logo" className="w-10 h-10 object-contain dark:hidden" />
            <img
              src="/images/logo-ive-white.png"
              alt="IVE Logo"
              className="w-10 h-10 object-contain hidden dark:block"
            />
            <div>
              <h2 className="font-bold text-lg">IVE Admin</h2>
              <p className="text-xs text-muted-foreground">Panel Administrativo</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.label ? (
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase px-3 py-1">
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5 flex shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

