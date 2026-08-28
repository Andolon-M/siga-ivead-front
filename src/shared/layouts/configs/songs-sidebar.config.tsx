import React from "react"
import { Music, Plus, Tag, SlidersHorizontal } from "lucide-react"
import type { ModuleSidebarConfig } from "../types/module-sidebar.types"

const SongsActiveBadge = () => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
    <span>IVE Alabanza</span>
  </div>
)

export const songsSidebarConfig: ModuleSidebarConfig = {
  brand: {
    title: "Cancionero",
    subtitle: "IVE Alabanza & Música",
    logo: <Music className="h-6 w-6 text-primary" />,
  },
  backTo: {
    to: "/admin",
    label: "Volver al Panel Admin",
  },
  groups: [
    {
      items: [
        {
          title: "Repertorio",
          href: "/admin/songs",
          icon: Music,
          description: "Catálogo de canciones y acordes",
          permission: { resource: "songs", action: "read" },
        },
        {
          title: "Nueva Canción",
          href: "/admin/songs/new",
          icon: Plus,
          description: "Registrar nueva canción",
          permission: { resource: "songs", action: "create" },
        },
        {
          title: "Catálogos y Ajustes",
          href: "/admin/songs/settings",
          icon: SlidersHorizontal,
          description: "Tipos, temas, artistas y versiones",
          permission: { resource: "songs", action: "manage_types" },
        },
      ],
    },
  ],
  footerSlot: <SongsActiveBadge />,
}
