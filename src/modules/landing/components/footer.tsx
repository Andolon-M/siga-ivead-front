import { Link } from "react-router-dom"
import { useState } from "react"
import { LoginModal } from "./login-modal"
import { useTheme } from "@/shared/contexts/theme-provider"

export function Footer() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { theme } = useTheme()

  const footerLinks = [
    { to: "#inicio", label: "Inicio" },
    { to: "#quienes-somos", label: "Quiénes somos" },
    { to: "#horarios", label: "Horarios" },
    { to: "#predicas", label: "Prédicas" },
    { to: "#contactenos", label: "Contáctenos" },
  ]

  const iveLogoSrc = theme === "dark" ? "/images/logo-ive-white.png" : "/images/logo-ive-color.png"
  const adLogoSrc = theme === "dark" ? "/images/logo-ad-white.png" : "/images/logo-ad-color.png"

  return (
    <>
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Logo and AD */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <img
                  src={iveLogoSrc || "/placeholder.svg"}
                  alt="IVE Logo"
                  className="w-20 h-20 object-contain mb-2 transition-all duration-300"
                />
                <span className="text-xs font-semibold text-center">IGLESIA VIDA Y ESPERANZA</span>
              </div>
              <div className="h-16 w-px bg-border" />
              <img
                src={adLogoSrc || "/placeholder.svg"}
                alt="AD Logo"
                className="w-16 h-16 object-contain transition-all duration-300"
              />
            </div>

            {/* Links */}
            <div>
              <div className="space-y-2 mb-4">
                <Link to="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Política de Privasidad
                </Link>
                <Link to="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Personeria juridica
                </Link>
              </div>
              <nav className="space-y-2">
                {footerLinks.map((link) => (
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

            {/* Login */}
            <div className="flex justify-end">
              {/* <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Iniciar session
              </button> */}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">© 2025 Versión 3.0.0 All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  )
}
