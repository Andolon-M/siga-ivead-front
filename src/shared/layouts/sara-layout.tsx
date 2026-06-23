import { useState, Suspense } from "react"
import { Outlet } from "react-router-dom"
import { SaraSidebar } from "@/shared/components/sara/sara-sidebar"
import { SaraHeader } from "@/shared/components/sara/sara-header"

export function SaraLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SaraSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SaraHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
