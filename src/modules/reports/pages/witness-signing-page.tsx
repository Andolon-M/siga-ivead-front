import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { reportsService } from "../services/reports.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, PenTool } from "lucide-react"

export function WitnessSigningPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<any>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await reportsService.getSigningReportData(token)
        setReportData(data)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Error al cargar reporte.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
    }
  }

  // Configuración del canvas de firma
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e, canvas)

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e, canvas)

    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.strokeStyle = "#1e293b"
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSign = async () => {
    if (!token || !hasSignature) return
    const canvas = canvasRef.current
    if (!canvas) return

    setSubmitting(true)
    setError(null)

    // Capturar geolocalización si está disponible
    let geolocation = "sin_ubicacion"
    try {
      if ("geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
        })
        geolocation = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
      }
    } catch {
      // Ignorar rechazo de permisos de geolocalización
    }

    try {
      const signatureBase64 = canvas.toDataURL("image/png")
      const result = await reportsService.submitSignature(token, signatureBase64, geolocation)
      setSuccessResult(result)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al registrar la firma.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Cargando datos del balance...</p>
        </div>
      </div>
    )
  }

  if (error && !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full shadow-lg border-destructive/30">
          <CardHeader>
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <CardTitle>Enlace no disponible</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (successResult || reportData?.alreadySigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-lg w-full shadow-lg border-green-500/40">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-2xl text-green-700">¡Firma Registrada Exitosamente!</CardTitle>
            <CardDescription>
              El informe semanal de la iglesia ha sido firmado y auditado electrónicamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Testigo:</span>
                <span className="text-slate-900 font-medium">{reportData?.witnessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Total Ingresos:</span>
                <span className="text-green-700 font-bold">${reportData?.totalIncome?.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Total Egresos:</span>
                <span className="text-red-700 font-bold">${reportData?.totalEgress?.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-2">
                <span className="font-semibold text-slate-700">Balance Neto:</span>
                <span className="font-extrabold text-slate-900">${reportData?.netBalance?.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {successResult?.securityHash && (
              <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-600 break-all font-mono">
                <span className="font-semibold block text-slate-700">Sello Criptográfico SHA-256:</span>
                {successResult.securityHash}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Gracias por tu servicio y fidelidad como testigo de la iglesia IVEAD. Puedes cerrar esta ventana.
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Auditoría de Testigo IVEAD
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Firma Electrónica de Balance</h1>
          <p className="text-sm text-muted-foreground">
            Hola <strong className="text-slate-800">{reportData?.witnessName}</strong>, has sido seleccionado como testigo
            del balance semanal de la congregación.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Resumen Financiero de la Semana</CardTitle>
            <CardDescription>Revisa los valores totales registrados antes de estampar tu firma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-100 p-3 rounded-md">
                <span className="text-xs text-muted-foreground font-medium block">Total Ingresos</span>
                <span className="text-lg font-bold text-green-700">
                  ${reportData?.totalIncome?.toLocaleString("es-CO")}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {reportData?.totalDepositsCount} transacciones
                </span>
              </div>
              <div className="bg-slate-100 p-3 rounded-md">
                <span className="text-xs text-muted-foreground font-medium block">Total Egresos</span>
                <span className="text-lg font-bold text-red-700">
                  ${reportData?.totalEgress?.toLocaleString("es-CO")}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {reportData?.totalEgressesCount} comprobantes
                </span>
              </div>
            </div>

            <div className="bg-primary/5 p-3 rounded-md border border-primary/20 flex justify-between items-center">
              <span className="font-semibold text-sm text-slate-800">Balance Neto en Caja:</span>
              <span className="text-xl font-extrabold text-primary">
                ${reportData?.netBalance?.toLocaleString("es-CO")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <PenTool className="h-4 w-4 text-primary" />
                Estampar Firma
              </CardTitle>
              {hasSignature && (
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs h-7">
                  Borrar y repetir
                </Button>
              )}
            </div>
            <CardDescription>Dibuja tu firma con el dedo o puntero en el recuadro blanco.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden touch-none">
              <canvas
                ref={canvasRef}
                width={400}
                height={160}
                className="w-full h-40 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Al firmar, se registrará tu dirección IP y sello digital de validez para garantizar transparencia.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              disabled={!hasSignature || submitting}
              onClick={handleSign}
            >
              {submitting ? "Validando y firmando..." : "Confirmar y Firmar Balance"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
