import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X, LogIn, LayoutDashboard, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { useTheme } from "@/shared/contexts/theme-provider"
import { useAuth } from "@/shared/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.querySelector(targetId)
    if (target) {
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80 // 80px offset for navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsMobileMenuOpen(false)
  }

  const getInitials = (email?: string) => {
    return (email?.slice(0, 2) || "U").toUpperCase()
  }

  const navLinks = [
    { to: "#inicio", label: "Inicio" },
    { to: "#predicas", label: "Prédicas" },
    { to: "#horarios", label: "Horarios" },
    { to: "#quienes-somos", label: "Sobre nosotros" },
    { to: "#contactenos", label: "Contáctenos" },
  ]

  const navTextWhite = resolvedTheme === "dark" || !isScrolled
  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/logo-ive-white.png"
      : isScrolled
        ? "/images/logo-ive-color.png"
        : "/images/logo-ive-white.png"
  const textColor = navTextWhite ? "text-white" : "text-foreground"
  const subtextColor = navTextWhite ? "text-white/80" : "text-muted-foreground"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent backdrop-blur-md"
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
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${
                  navTextWhite ? "text-white" : "text-foreground"
                } ${link.to === "#inicio" ? "bg-primary text-primary-foreground" : ""}`}
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 h-auto transition-all",
                      navTextWhite
                        ? "text-white hover:bg-white/15 hover:text-white border border-white/20"
                        : "text-foreground hover:bg-accent border border-border"
                    )}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                        {getInitials(user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-sm font-medium">
                      {user?.email.split("@")[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate h-4">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user?.role?.name || "Usuario"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>SIGA Inicio</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className={
                    navTextWhite
                      ? "bg-white text-primary hover:bg-white/90 shadow-sm"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}

            <ThemeToggle
              className={navTextWhite ? "text-white hover:bg-white/15 hover:text-white" : ""}
              iconClassName={navTextWhite && resolvedTheme !== "dark" ? "text-white" : undefined}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle
              className={navTextWhite ? "text-white hover:bg-white/15 hover:text-white" : ""}
              iconClassName={navTextWhite && resolvedTheme !== "dark" ? "text-white" : undefined}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={navTextWhite ? "text-white hover:bg-white/15 hover:text-white" : ""}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 animate-in slide-in-from-top">
            <div className="flex flex-col gap-2 rounded-xl bg-card/95 backdrop-blur-md p-4 border shadow-lg">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${
                    link.to === "#inicio" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2 border-t mt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role?.name || "Usuario"}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => {
                        navigate("/admin")
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      SIGA Inicio
                    </Button>
                    <Button 
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" 
                      size="sm"
                      variant="ghost"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
