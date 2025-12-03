import { Link } from "react-router-dom"
import { useTheme } from "@/shared/contexts/theme-provider"
import { LogIn } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export function Footer() {
  const { theme } = useTheme()

  const navigationLinks = [
    { to: "#inicio", label: "Inicio" },
    { to: "#quienes-somos", label: "Quiénes somos" },
    { to: "#horarios", label: "Horarios" },
    { to: "#predicas", label: "Prédicas" },
    { to: "#contactenos", label: "Contáctenos" },
  ]

  const legalLinks = [
    { to: "/privacy-policy", label: "Política de Privacidad" },
    { to: "#", label: "Personería Jurídica" },
  ]

  const iveLogoSrc = theme === "dark" ? "/images/logo-ive-white.png" : "/images/logo-ive-color.png"
  const adLogoSrc = theme === "dark" ? "/images/logo-ad-white.png" : "/images/logo-ad-color.png"

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.querySelector(targetId)
    if (target) {
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sección 1: Logos */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4 ">
              <div className="flex flex-row items-center">
                <img
                  src={iveLogoSrc || "/placeholder.svg"}
                  alt="IVE Logo"
                  className="w-16 h-16 object-contain mr-2 transition-all duration-300"
                />
                <span className="text-xs font-semibold text-start  leading-tight">
                  IGLESIA <br /> VIDA Y <br /> ESPERANZA
                </span>
              </div>
              <div className="h-20 w-px bg-border" />
              <img
                src={adLogoSrc || "/placeholder.svg"}
                alt="AD Logo"
                className="w-16 h-16 object-contain transition-all duration-300"
              />
            </div>
          </div>

          {/* Sección 2: Navegación */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Navegación</h3>
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Sección 3: Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <nav className="space-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sección 4: Acceso */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Acceso</h3>
            <Link to="/login">
              <Button variant="outline" className="w-full md:w-auto">
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Accede al sistema de gestión administrativa
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Iglesia Vida y Esperanza. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Versión 3.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
