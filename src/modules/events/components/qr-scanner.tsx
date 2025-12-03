import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Camera, CheckCircle, XCircle } from "lucide-react"
import type { Attendee } from "../types"

interface QRScannerProps {
  eventId: string | number
  sessionId: number
  onScanSuccess?: (attendee: Attendee) => void
}

export function QRScanner({ eventId, sessionId, onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<Attendee | null>(null)
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null)

  const handleStartScan = () => {
    setIsScanning(true)
    console.log("Starting QR scanner for event:", eventId, "session:", sessionId)
  }

  const handleStopScan = () => {
    setIsScanning(false)
    setScanResult(null)
  }

  const handleScanSuccess = (data: string) => {
    console.log("QR scanned:", data, "for session:", sessionId)
    // Mock validation - en producción, esto crearía/actualizaría SessionAttendance
    const mockAttendee: Attendee = {
      id: 1,
      member: {
        id: 1,
        name: "María García",
        dni: "1234567890",
        cell: "3001234567",
      },
      status: "CONFIRMADO",
      paidStatus: "COMPLETO",
      amountPaid: 150000,
      qrCode: data,
      confirmedAt: new Date().toISOString(),
      sessionAttendance: [],
    }
    setScannedData(mockAttendee)
    setScanResult("success")
    setIsScanning(false)
    onScanSuccess?.(mockAttendee)
  }

  return (
    <div className="space-y-4">
      {!isScanning && !scannedData && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Camera className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-semibold mb-2">Escanear Código QR</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Activa la cámara para escanear el código QR del asistente
            </p>
          </div>
          <Button onClick={handleStartScan} size="lg">
            <Camera className="h-4 w-4 mr-2" />
            Activar Cámara
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-primary rounded-lg animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Apunta la cámara al código QR</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleStopScan} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={() => handleScanSuccess("QR-001-2025")} className="flex-1">
              Simular Escaneo
            </Button>
          </div>
        </div>
      )}

      {scannedData && (
        <div className="space-y-4">
          <Card className={scanResult === "success" ? "border-green-500" : "border-red-500"}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {scanResult === "success" ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {scanResult === "success" ? "Asistencia Registrada" : "Error de Validación"}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Nombre:</span> {scannedData.member.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">DNI:</span> {scannedData.member.dni}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Código QR:</span> {scannedData.qrCode}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Hora de Ingreso:</span>{" "}
                      {scannedData.confirmedAt
                        ? new Date(scannedData.confirmedAt).toLocaleTimeString("es-CO")
                        : "N/A"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Estado:</span>{" "}
                      <Badge variant="default">{scannedData.status}</Badge>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={() => {
              setScannedData(null)
              setScanResult(null)
              setIsScanning(true)
            }}
            className="w-full"
          >
            Escanear Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}

