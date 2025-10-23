import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { ThemeToggle } from "@/shared/components/theme-toggle"

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-10 w-full" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative flex-shrink-0">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  )
}

