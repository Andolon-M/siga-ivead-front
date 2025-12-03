import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Users, UserCircle, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Usuarios",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Miembros Activos",
      value: "342",
      change: "+8%",
      trend: "up",
      icon: UserCircle,
    },
    {
      title: "Eventos Este Mes",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Calendar,
    },
    {
      title: "Ingresos Mensuales",
      value: "$12,450",
      change: "-5%",
      trend: "down",
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel administrativo de IVE</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs flex items-center gap-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  <TrendIcon className="h-3 w-3" />
                  {stat.change} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nuevo miembro registrado", user: "Juan Pérez", time: "Hace 5 minutos" },
                { action: "Evento creado", user: "María García", time: "Hace 1 hora" },
                { action: "Reporte financiero generado", user: "Admin", time: "Hace 2 horas" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos programados esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Servicio Dominical", date: "Dom, 26 Ene", time: "9:00 AM" },
                { name: "Reunión de Oración", date: "Mié, 29 Ene", time: "7:00 PM" },
                { name: "Reunión Juvenil", date: "Sáb, 1 Feb", time: "6:00 PM" },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

