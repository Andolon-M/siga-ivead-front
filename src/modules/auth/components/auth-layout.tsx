import { type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Card } from "@/shared/components/ui/card"
import { Church, Calendar, Users, Heart } from "lucide-react"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

const announcements = [
  {
    icon: Church,
    title: "Bienvenido a IVE",
    description: "Iglesia Vida y Esperanza - Una comunidad de fe y esperanza",
    color: "text-primary",
  },
  {
    icon: Calendar,
    title: "Próximos Eventos",
    description: "Únete a nuestros servicios y actividades especiales cada semana",
    color: "text-blue-500",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Más de 500 miembros comprometidos con el servicio y la fe",
    color: "text-green-500",
  },
  {
    icon: Heart,
    title: "Misión y Visión",
    description: "Hacemos discípulos para Jesús que sirvan a Dios en la familia, iglesia y comunidad",
    color: "text-red-500",
  },
]

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel Lateral Izquierdo - Anuncios */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/10 via-primary/5 to-background p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo-ive-color.png"
            alt="IVE Logo"
            className="w-12 h-12 object-contain dark:hidden transition-transform group-hover:scale-110"
          />
          <img
            src="/images/logo-ive-white.png"
            alt="IVE Logo"
            className="w-12 h-12 object-contain hidden dark:block transition-transform group-hover:scale-110"
          />
          <div>
            <h2 className="font-bold text-2xl">IVE Admin</h2>
            <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold mb-2">Bienvenido</h3>
            <p className="text-muted-foreground text-lg">
              Administra tu iglesia de manera eficiente y organizada
            </p>
          </div>

          <div className="grid gap-6">
            {announcements.map((item, index) => {
              const Icon = item.icon
              return (
                <Card
                  key={index}
                  className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg"
                >
                  <div className="flex gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>© 2025 Iglesia Vida y Esperanza</p>
          <p>Todos los derechos reservados</p>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo para móvil */}
          <div className="lg:hidden flex flex-col items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/logo-ive-color.png"
                alt="IVE Logo"
                className="w-16 h-16 object-contain dark:hidden"
              />
              <img
                src="/images/logo-ive-white.png"
                alt="IVE Logo"
                className="w-16 h-16 object-contain hidden dark:block"
              />
              <div>
                <h2 className="font-bold text-2xl">IVE Admin</h2>
                <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
              </div>
            </Link>
          </div>

          {/* Título */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>

          {/* Contenido del formulario */}
          {children}
        </div>
      </div>
    </div>
  )
}

