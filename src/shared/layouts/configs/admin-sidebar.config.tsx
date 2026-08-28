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
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { ModuleSidebarConfig } from "../types/module-sidebar.types"

const SaraIcon = ({ className }: { className?: string }) => (
  <img
    src="/Sara%20perfil%20cuadrado.png"
    alt="Sara"
    className={cn("w-5 h-5 rounded-md object-cover", className)}
  />
)

const AdminLogo = () => (
  <>
    <img
      src="/images/logo-ive-color.png"
      alt="IVE Logo"
      className="w-10 h-10 object-contain dark:hidden"
    />
    <img
      src="/images/logo-ive-white.png"
      alt="IVE Logo"
      className="w-10 h-10 object-contain hidden dark:block"
    />
  </>
)

export const adminSidebarConfig: ModuleSidebarConfig = {
  brand: {
    title: "IVE Admin",
    subtitle: "Panel Administrativo",
    logo: <AdminLogo />,
  },
  groups: [
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
          permission: { resource: "members", action: "read" },
        },
        {
          title: "Ministerios",
          href: "/admin/ministries",
          icon: Church,
          permission: { resource: "ministries", action: "read" },
        },
        {
          title: "Cultos",
          href: "/admin/services",
          icon: CalendarDays,
          permission: { resource: "services", action: "read" },
        },
        {
          title: "Voluntarios",
          href: "/admin/volunteers",
          icon: HandHeart,
          permission: { resource: "volunteers", action: "read" },
        },
        {
          title: "Eventos",
          href: "/admin/events",
          icon: Calendar,
          permission: { resource: "events", action: "read" },
        },
        {
          title: "Archivos",
          href: "/admin/files",
          icon: FileText,
          permission: { resource: "files", action: "read" },
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
          permission: { resource: "reports", action: "read" },
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
          permission: { resource: "sara", action: "access" },
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
          permission: { resource: "users", action: "read" },
        },
        {
          title: "Roles y Permisos",
          href: "/admin/roles",
          icon: Shield,
          permission: { resource: "roles", action: "read" },
        },
      ],
    },
  ],
}
