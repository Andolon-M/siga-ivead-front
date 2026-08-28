import { MessageSquare, Send, FileText } from "lucide-react"
import type { ModuleSidebarConfig } from "../types/module-sidebar.types"

const SaraActiveBadge = () => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    <span>Sistema activo</span>
  </div>
)

export const saraSidebarConfig: ModuleSidebarConfig = {
  brand: {
    title: "SARA",
    subtitle: "Agente IA IVEAD",
    logo: "/Sara%20perfil%20cuadrado.png",
  },
  backTo: {
    to: "/admin",
    label: "Volver al Panel Admin",
  },
  groups: [
    {
      items: [
        {
          title: "Chats",
          href: "/admin/sara/chats",
          icon: MessageSquare,
          description: "Conversaciones con la IA",
          permission: { resource: "sara", action: "read_chats" },
        },
        {
          title: "Mensajería Masiva",
          href: "/admin/sara/mass-messaging",
          icon: Send,
          description: "Envío masivo de mensajes",
          permission: { resource: "mass_messaging", action: "read_campaigns" },
        },
        {
          title: "Plantillas Meta",
          href: "/admin/sara/meta-templates",
          icon: FileText,
          description: "Plantillas de WhatsApp",
          permission: { resource: "meta_templates", action: "read" },
        },
      ],
    },
  ],
  footerSlot: <SaraActiveBadge />,
}
