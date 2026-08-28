import { useState, Suspense } from "react"
import { Outlet } from "react-router-dom"
import { GenericSidebar } from "@/shared/components/layout/generic-sidebar"
import { AppHeader, type AppHeaderProps } from "@/shared/components/layout/app-header"
import type { ModuleSidebarConfig } from "./types/module-sidebar.types"

export interface ModularLayoutProps {
  config: ModuleSidebarConfig
  headerProps?: Omit<AppHeaderProps, "onMenuClick">
}

export function ModularLayout({ config, headerProps }: ModularLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <GenericSidebar
        config={config}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          {...headerProps}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
