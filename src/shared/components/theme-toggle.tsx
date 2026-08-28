import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/shared/contexts/theme-provider"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface ThemeToggleProps {
  className?: string
  iconClassName?: string
}

export function ThemeToggle({ className, iconClassName }: ThemeToggleProps = {}) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    // Cambia entre light y dark basándose en el tema resuelto actual
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("w-9 h-9 transition-all hover:scale-110", className)}
    >
      {resolvedTheme === "dark" ? (
        <Sun className={cn("h-5 w-5 text-yellow-400 transition-all rotate-0 scale-100", iconClassName)} />
      ) : (
        <Moon className={cn("h-5 w-5 text-slate-700 dark:text-slate-300 transition-all rotate-0 scale-100", iconClassName)} />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
