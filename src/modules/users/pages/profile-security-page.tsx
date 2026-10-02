import { useState, useEffect } from "react"
import { useAuth } from "@/shared/contexts/auth-context"
import { authService } from "@/modules/auth/services/auth.service"
import type { UserSession, TwoFactorSetupData, TwoFactorStatus } from "@/modules/auth/types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { toast } from "sonner"
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Shield,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  RefreshCw,
  QrCode,
  Copy,
  Download,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Clock,
  Globe
} from "lucide-react"

export function ProfileSecurityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("sessions")

  // Estado de Sesiones
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isRevokingOthers, setIsRevokingOthers] = useState(false)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)

  // Estado de 2FA
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus>({ isEnabled: false, confirmedAt: null })
  const [isLoading2FA, setIsLoading2FA] = useState(false)
  
  // Modal de Setup 2FA
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)
  const [setupStep, setSetupStep] = useState<"qr" | "backup">("qr")
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)

  // Modal de Desactivar 2FA
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [disablePassword, setDisablePassword] = useState("")
  const [isDisabling2FA, setIsDisabling2FA] = useState(false)

  // Cargar Sesiones
  const loadSessions = async () => {
    setIsLoadingSessions(true)
    try {
      const data = await authService.getSessions()
      setSessions(data)
    } catch (error) {
      console.error("Error al cargar sesiones:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // Cargar estado de 2FA
  const load2FAStatus = async () => {
    setIsLoading2FA(true)
    try {
      const data = await authService.get2FAStatus()
      setTwoFactorStatus(data)
    } catch (error) {
      console.error("Error al cargar estado 2FA:", error)
    } finally {
      setIsLoading2FA(false)
    }
  }

  useEffect(() => {
    loadSessions()
    load2FAStatus()
  }, [])

  // Revocar una sesión específica
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId)
    try {
      await authService.revokeSession(sessionId)
      toast.success("Sesión cerrada correctamente")
      await loadSessions()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al cerrar sesión")
    } finally {
      setRevokingSessionId(null)
    }
  }

  // Revocar las demás sesiones
  const handleRevokeOthers = async () => {
    setIsRevokingOthers(true)
    try {
      await authService.revokeOtherSessions()
      toast.success("Se han cerrado todas las demás sesiones activas")
      await loadSessions()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al cerrar las demás sesiones")
    } finally {
      setIsRevokingOthers(false)
    }
  }

  // Iniciar configuración de 2FA
  const handleStart2FASetup = async () => {
    setIsLoading2FA(true)
    try {
      const data = await authService.setup2FA()
      setSetupData(data)
      setSetupStep("qr")
      setVerificationCode("")
      setIsSetupModalOpen(true)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al iniciar configuración de 2FA")
    } finally {
      setIsLoading2FA(false)
    }
  }

  // Confirmar y activar 2FA
  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim()) return

    setIsVerifyingCode(true)
    try {
      const result = await authService.enable2FA(verificationCode.trim())
      toast.success("¡2FA activado con éxito!")
      setBackupCodes(result.backupCodes)
      setSetupStep("backup")
      await load2FAStatus()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Código incorrecto")
    } finally {
      setIsVerifyingCode(false)
    }
  }

  // Desactivar 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!disablePassword) return

    setIsDisabling2FA(true)
    try {
      await authService.disable2FA({ password: disablePassword })
      toast.success("Autenticación en dos pasos desactivada")
      setIsDisableModalOpen(false)
      setDisablePassword("")
      await load2FAStatus()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al desactivar 2FA")
    } finally {
      setIsDisabling2FA(false)
    }
  }

  // Copiar códigos de respaldo
  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success("Códigos de respaldo copiados al portapapeles")
  }

  // Descargar códigos de respaldo
  const handleDownloadBackupCodes = () => {
    const content = `CÓDIGOS DE RESPALDO - SIGA IVEAD\nCuenta: ${user?.email}\nFecha: ${new Date().toLocaleString()}\n\nGuarda estos códigos en un lugar seguro. Cada uno puede usarse una sola vez:\n\n${backupCodes.join("\n")}`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `siga-backup-codes-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType?.toLowerCase()
    if (type === "mobile") return <Smartphone className="h-5 w-5 text-muted-foreground" />
    if (type === "tablet") return <Tablet className="h-5 w-5 text-muted-foreground" />
    return <Laptop className="h-5 w-5 text-muted-foreground" />
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Encabezado del perfil */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-card border rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {user?.email?.slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mi Perfil y Seguridad</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize text-xs">
                {user?.role?.name || "Usuario"}
              </Badge>
              {twoFactorStatus.isEnabled && (
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" /> 2FA Activo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="sessions" className="gap-2">
            <Monitor className="h-4 w-4" />
            Dispositivos y Sesiones
          </TabsTrigger>
          <TabsTrigger value="2fa" className="gap-2">
            <Shield className="h-4 w-4" />
            Autenticación de 2 Pasos (2FA)
          </TabsTrigger>
        </TabsList>

        {/* ================= PESTAÑA: SESIONES ACTIVAS ================= */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Sesiones Abiertas y Dispositivos
                </CardTitle>
                <CardDescription>
                  Administra los navegadores y dispositivos donde tienes una sesión activa en el sistema.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSessions}
                  disabled={isLoadingSessions}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingSessions ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                {sessions.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRevokeOthers}
                    disabled={isRevokingOthers}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {isRevokingOthers ? "Cerrando..." : "Cerrar las demás sesiones"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Cargando dispositivos activos...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron sesiones activas.
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        session.isCurrent ? "bg-primary/5 border-primary/40 shadow-xs" : "bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-muted border shrink-0 mt-0.5">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base">
                              {session.deviceName || `${session.browser || "Navegador"} en ${session.os || "Dispositivo"}`}
                            </span>
                            {session.isCurrent && (
                              <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Este dispositivo
                              </Badge>
                            )}
                            {session.isTrusted && (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs gap-1">
                                <ShieldCheck className="h-3 w-3" /> Dispositivo de Confianza (30 días)
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" /> IP: {session.ipAddress || "Desconocida"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Última actividad: {formatDate(session.lastActive)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {session.isCurrent ? (
                          <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded">
                            Sesión Activa
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1.5"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revokingSessionId === session.id}
                          >
                            {revokingSessionId === session.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Cerrar Sesión
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-3 px-6 text-xs text-muted-foreground">
              💡 Los dispositivos de confianza mantienen la sesión abierta hasta por 30 días siempre que ingreses o realices actividad al menos una vez cada 3 días.
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ================= PESTAÑA: AUTENTICACIÓN 2FA ================= */}
        <TabsContent value="2fa" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Autenticación de Dos Factores (2FA)
                  </CardTitle>
                  <CardDescription>
                    Agrega una capa adicional de protección a tu cuenta solicitando un código de tu app autenticadora al iniciar sesión.
                  </CardDescription>
                </div>
                <Badge
                  variant={twoFactorStatus.isEnabled ? "default" : "secondary"}
                  className={twoFactorStatus.isEnabled ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""}
                >
                  {twoFactorStatus.isEnabled ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFactorStatus.isEnabled ? (
                <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                        Tu cuenta está protegida con 2FA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {twoFactorStatus.confirmedAt
                          ? `Activado el ${formatDate(twoFactorStatus.confirmedAt)}`
                          : "Protección activa"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cada vez que inicies sesión desde un dispositivo nuevo o no confiable, se te solicitará un código de 6 dígitos generado por tu aplicación autenticadora (Google Authenticator, Authy, etc.).
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDisableModalOpen(true)}
                    >
                      Desactivar 2FA
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border bg-muted/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">La autenticación de dos factores está desactivada</p>
                      <p className="text-sm text-muted-foreground">
                        Te recomendamos habilitar 2FA para proteger tu cuenta de accesos no autorizados. Compatible con Google Authenticator, Microsoft Authenticator, Authy y 1Password.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleStart2FASetup}
                    disabled={isLoading2FA}
                    className="gap-2"
                  >
                    {isLoading2FA ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                    Configurar 2FA con App Autenticadora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= MODAL SETUP 2FA ================= */}
      <Dialog open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
        <DialogContent className="sm:max-w-md">
          {setupStep === "qr" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" /> Configurar Autenticador
                </DialogTitle>
                <DialogDescription>
                  Escanea el código QR desde tu app autenticadora (Google Authenticator o Authy).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {setupData?.qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white rounded-xl border w-fit mx-auto shadow-xs">
                    <img
                      src={setupData.qrCodeUrl}
                      alt="Código QR 2FA"
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-1.5 text-center">
                  <span className="text-xs text-muted-foreground">¿No puedes escanear el código? Ingresa esta clave:</span>
                  <div className="flex items-center justify-center gap-2 font-mono text-xs bg-muted p-2 rounded-lg border">
                    <span className="select-all font-semibold tracking-wider">{setupData?.secret}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (setupData?.secret) {
                          navigator.clipboard.writeText(setupData.secret)
                          toast.success("Clave copiada")
                        }
                      }}
                      className="hover:text-primary"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirm2FA} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="verificationCode" className="text-sm">
                      Código de 6 dígitos generado por tu app:
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        className="pl-10 text-center text-lg tracking-widest font-mono"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSetupModalOpen(false)}
                      disabled={isVerifyingCode}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isVerifyingCode || verificationCode.length < 6}>
                      {isVerifyingCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                        </>
                      ) : (
                        "Activar 2FA"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" /> Códigos de Respaldo Generados
                </DialogTitle>
                <DialogDescription>
                  Guarda estos 10 códigos en un lugar seguro. Si pierdes acceso a tu aplicación autenticadora, podrás iniciar sesión con cualquiera de ellos.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-center text-sm font-semibold border">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-1 bg-background rounded border">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleCopyBackupCodes}
                  >
                    <Copy className="h-4 w-4" /> Copiar Códigos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleDownloadBackupCodes}
                  >
                    <Download className="h-4 w-4" /> Descargar TXT
                  </Button>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setIsSetupModalOpen(false)}
                  >
                    Entendido y Guardado
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL DESACTIVAR 2FA ================= */}
      <Dialog open={isDisableModalOpen} onOpenChange={setIsDisableModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Desactivar 2FA
            </DialogTitle>
            <DialogDescription>
              Por seguridad, introduce tu contraseña actual para confirmar la desactivación del segundo factor de autenticación.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDisable2FA} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="disablePassword">Contraseña actual</Label>
              <Input
                id="disablePassword"
                type="password"
                placeholder="••••••••"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDisableModalOpen(false)}
                disabled={isDisabling2FA}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDisabling2FA || !disablePassword}
              >
                {isDisabling2FA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Desactivando...
                  </>
                ) : (
                  "Confirmar Desactivación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
