import { Link, useLocation } from "react-router-dom"
import { cn } from "@/shared/lib/utils"
import {
  Users,
  UserCircle,
  Church,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  LayoutDashboard,
  Shield,
  Briefcase,
  X,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
  },
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
    title: "Eventos",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Equipos de Trabajo",
    href: "/admin/teams",
    icon: Briefcase,
  },
  {
    title: "Reportes Financieros",
    href: "/admin/reports",
    icon: DollarSign,
  },
  {
    title: "Archivos",
    href: "/admin/files",
    icon: FileText,
  },
  {
    title: "Roles y Permisos",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings,
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
        <div className="p-4 lg:p-6 border-b flex items-center justify-between  shrink-0">
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
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 flex shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        
      </aside>
    </>
  )
}

