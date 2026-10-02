import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { AuthLayout } from "../../components/auth-layout"
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react"
import { authService } from "../../services/auth.service"
import { useAuth } from "@/shared/contexts/auth-context"
import type { LoginCredentials } from "../../types"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
    trustDevice: true,
  })

  // Estado para el flujo de 2FA
  const [requires2FA, setRequires2FA] = useState(false)
  const [challengeToken, setChallengeToken] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await authService.login(formData)

      // Si el backend solicita verificación de segundo factor (2FA)
      if (result.requires2FA && result.challengeToken) {
        setChallengeToken(result.challengeToken)
        setRequires2FA(true)
        setIsLoading(false)
        return
      }

      if (result.token) {
        await login(result.token)
        const from = (location.state as any)?.from?.pathname || "/admin"
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!twoFactorCode.trim()) return

    setIsLoading(true)
    try {
      const token = await authService.verify2FA(challengeToken, twoFactorCode.trim(), trustDevice)
      await login(token)
      const from = (location.state as any)?.from?.pathname || "/admin"
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Error al verificar 2FA:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Vista del Desafío 2FA
  if (requires2FA) {
    return (
      <AuthLayout
        title="Verificación en Dos Pasos"
        subtitle="Ingresa el código de 6 dígitos de tu aplicación autenticadora o un código de respaldo"
      >
        <form onSubmit={handleVerify2FA} className="space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-muted/60 rounded-lg flex items-center gap-3 text-sm text-muted-foreground border">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span>Tu cuenta está protegida con autenticación de dos factores (2FA).</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Código de Verificación</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="Ej: 123456 o código de respaldo"
                  className="pl-10 tracking-widest text-base font-mono"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={12}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="trustDevice"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
              />
              <Label htmlFor="trustDevice" className="text-sm font-normal cursor-pointer leading-tight">
                Confiar en este dispositivo por 30 días
                <span className="block text-xs text-muted-foreground mt-0.5">
                  No te volveremos a pedir 2FA en este equipo mientras mantengas actividad
                </span>
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading || !twoFactorCode.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar y Acceder"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setRequires2FA(false)
                setTwoFactorCode("")
                setChallengeToken("")
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  // Vista de Login normal
  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Ingresa tus credenciales para acceder al sistema"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Recordarme
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          Al iniciar sesión, aceptas nuestra{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            Política de Privacidad y tratamiento de datos
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
