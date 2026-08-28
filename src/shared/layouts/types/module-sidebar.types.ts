import type React from "react"

export interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string | number
  permission?: { resource: string; action: string }
  anyPermissions?: Array<{ resource: string; action: string }>
  role?: string
}

export interface SidebarGroup {
  label?: string
  items: SidebarItem[]
}

export interface ModuleBrandConfig {
  title: string
  subtitle?: string
  logo?: string | React.ReactNode
}

export interface ModuleBackToConfig {
  to: string
  label: string
}

export interface ModuleSidebarConfig {
  brand: ModuleBrandConfig
  backTo?: ModuleBackToConfig
  groups: SidebarGroup[]
  footerSlot?: React.ReactNode
}
