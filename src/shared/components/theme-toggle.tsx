import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/shared/contexts/theme-provider"
import { Button } from "@/shared/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 transition-all hover:scale-110">
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all rotate-0 scale-100" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300 transition-all rotate-0 scale-100" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
