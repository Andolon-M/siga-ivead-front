import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from "lucide-react"

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <img
              src="/images/logo-ive-color.png"
              alt="IVE Logo"
              className="w-10 h-10 object-contain dark:hidden"
            />
            <img
              src="/images/logo-ive-white.png"
              alt="IVE Logo"
              className="w-10 h-10 object-contain hidden dark:block"
            />
            <div>
              <h2 className="font-bold text-xl">IVE</h2>
              <p className="text-xs text-muted-foreground">Iglesia Vida y Esperanza</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Política de Privacidad</h1>
            <p className="text-muted-foreground text-lg">
              Última actualización: Diciembre 2025
            </p>
          </div>

          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                En la Iglesia Vida y Esperanza (IVE), nos comprometemos a proteger tu privacidad y garantizar la
                seguridad de tu información personal. Esta política describe cómo recopilamos, usamos y protegemos
                tus datos.
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Recopilamos la siguiente información:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Información de contacto (nombre, correo electrónico, teléfono)</li>
                        <li>Información de identificación (documento de identidad)</li>
                        <li>Datos de participación en eventos y ministerios</li>
                        <li>Información financiera relacionada con donaciones y eventos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2. Uso de la Información</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Utilizamos tu información para:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Gestionar tu membresía en la iglesia</li>
                        <li>Coordinar eventos y actividades</li>
                        <li>Enviar comunicaciones importantes sobre la iglesia</li>
                        <li>Procesar donaciones y pagos de eventos</li>
                        <li>Mejorar nuestros servicios y programas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">3. Protección de Datos</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Implementamos medidas de seguridad para proteger tu información:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Encriptación de datos sensibles</li>
                        <li>Acceso restringido solo a personal autorizado</li>
                        <li>Copias de seguridad regulares</li>
                        <li>Auditorías de seguridad periódicas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-3">4. Tus Derechos</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>Tienes derecho a:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Acceder a tu información personal</li>
                    <li>Solicitar corrección de datos inexactos</li>
                    <li>Solicitar eliminación de tus datos</li>
                    <li>Oponerte al procesamiento de tu información</li>
                    <li>Solicitar portabilidad de tus datos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-3">5. Compartir Información</h2>
                <p className="text-muted-foreground">
                  No compartimos tu información personal con terceros, excepto cuando sea necesario para el
                  funcionamiento de la iglesia (ej. procesadores de pago) o cuando lo requiera la ley.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-3">6. Contacto</h2>
                <p className="text-muted-foreground">
                  Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
                </p>
                <div className="text-muted-foreground space-y-1 mt-2">
                  <p>Email: <strong>contactenos@ivead.org</strong></p>
                  <p>Teléfono: <strong>+57 317 375 6718</strong></p>
                  <p>Dirección: <strong>Cra 12 # 14 Norte - 66 Piso 2 Kennedy, Bucaramanga</strong></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Iniciar Sesión
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button className="w-full">
                Ir al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

