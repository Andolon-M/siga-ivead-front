import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { useTheme } from "@/shared/contexts/theme-provider"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { to: "#inicio", label: "Inicio" },
    { to: "#quienes-somos", label: "Quienes somos" },
    { to: "#predicas", label: "Predicas" },
    { to: "#donaciones", label: "Donaciones" },
    { to: "#contactenos", label: "Contactenos" },
  ]

  const logoSrc =
    theme === "dark"
      ? "/images/logo-ive-white.png"
      : isScrolled
        ? "/images/logo-ive-color.png"
        : "/images/logo-ive-white.png"
  const textColor = theme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"
  const subtextColor = theme === "dark" ? "text-white/80" : isScrolled ? "text-muted-foreground" : "text-white/80"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="#inicio" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
              <img src={logoSrc || "/placeholder.svg"} alt="IVE Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg leading-tight ${textColor}`}>IGLESIA VIDA Y ESPERANZA</span>
              <span className={`text-xs ${subtextColor}`}>Asambleas de Dios</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${
                  theme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"
                } ${link.to === "#inicio" ? "bg-primary text-primary-foreground" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <div
              className={
                theme === "dark"
                  ? "[&_button]:text-white [&_button]:hover:bg-white/10"
                  : isScrolled
                    ? ""
                    : "[&_button]:text-white [&_button]:hover:bg-white/10"
              }
            >
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className={
                theme === "dark"
                  ? "[&_button]:text-white [&_button]:hover:bg-white/10"
                  : isScrolled
                    ? ""
                    : "[&_button]:text-white [&_button]:hover:bg-white/10"
              }
            >
              <ThemeToggle />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className={theme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"} />
              ) : (
                <Menu className={theme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${
                    link.to === "#inicio" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
