import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Search,
  QrCode,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Download,
  CalendarDays,
  TrendingUp,
  PieChart,
  FileText,
} from "lucide-react"
import { QRScanner } from "../components/qr-scanner"
import type {
  Event,
  EventSession,
  Attendee,
  Member,
  PaymentType,
  PaymentStatus,
  CreateSessionData,
  UpdateSessionData,
  PaymentData,
} from "../types"

// Mock data
const mockEvent: Event = {
  id: 1,
  title: "Retiro Juvenil 2025",
  description: "Retiro espiritual para jóvenes de 15 a 25 años",
  status: "PLANIFICADO",
  hasPrice: true,
  price: 150000,
  ministry: "Ministerio Juvenil",
  responsible: "Pastor Juan Pérez",
  location: "Centro de Retiros La Montaña",
  date: "2025-02-15",
  time: "8:00 AM",
  capacity: 50,
  registered: 32,
}

const mockSessions: EventSession[] = [
  {
    id: 1,
    title: "Sesión de Apertura",
    startDate: "2025-02-15T08:00:00",
    endDate: "2025-02-15T12:00:00",
    location: "Centro de Retiros La Montaña - Auditorio Principal",
    capacity: 50,
    registered: 32,
  },
  {
    id: 2,
    title: "Taller de Liderazgo",
    startDate: "2025-02-15T14:00:00",
    endDate: "2025-02-15T18:00:00",
    location: "Centro de Retiros La Montaña - Sala de Conferencias",
    capacity: 30,
    registered: 25,
  },
  {
    id: 3,
    title: "Sesión de Clausura",
    startDate: "2025-02-17T15:00:00",
    endDate: "2025-02-17T17:00:00",
    location: "Centro de Retiros La Montaña - Auditorio Principal",
    capacity: 50,
    registered: 28,
  },
]

const mockAttendees: Attendee[] = [
  {
    id: 1,
    member: { id: 1, name: "María García", dni: "1234567890", cell: "3001234567" },
    status: "CONFIRMADO",
    paidStatus: "COMPLETO",
    amountPaid: 150000,
    qrCode: "QR-001-2025",
    confirmedAt: "2025-01-20",
    sessionAttendance: [
      { sessionId: 1, status: "ASISTIO", checkInTime: "2025-02-15T08:15:00" },
      { sessionId: 2, status: "ASISTIO", checkInTime: "2025-02-15T14:10:00" },
    ],
  },
  {
    id: 2,
    member: { id: 2, name: "Carlos Rodríguez", dni: "0987654321", cell: "3009876543" },
    status: "REGISTRADO",
    paidStatus: "PENDIENTE",
    amountPaid: 0,
    qrCode: null,
    confirmedAt: null,
    sessionAttendance: [],
  },
  {
    id: 3,
    member: { id: 3, name: "Ana Martínez", dni: "1122334455", cell: "3112233445" },
    status: "CONFIRMADO",
    paidStatus: "PARCIAL",
    amountPaid: 75000,
    qrCode: "QR-003-2025",
    confirmedAt: "2025-01-22",
    sessionAttendance: [{ sessionId: 1, status: "ASISTIO", checkInTime: "2025-02-15T08:20:00" }],
  },
]

const mockMembers: Member[] = [
  { id: 1, name: "María García", dni: "1234567890", cell: "3001234567" },
  { id: 2, name: "Carlos Rodríguez", dni: "0987654321", cell: "3009876543" },
  { id: 3, name: "Ana Martínez", dni: "1122334455", cell: "3112233445" },
  { id: 4, name: "Pedro López", dni: "5566778899", cell: "3155667788" },
]

const statusColors = {
  REGISTRADO: "secondary",
  CONFIRMADO: "default",
  ASISTIO: "default",
  AUSENTE: "destructive",
  CANCELADO: "destructive",
} as const

const paymentStatusColors = {
  PENDIENTE: "destructive",
  PARCIAL: "secondary",
  COMPLETO: "default",
  EXONERADO: "outline",
} as const

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("details")
  const [isAddAttendeeModalOpen, setIsAddAttendeeModalOpen] = useState(false)
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<EventSession | null>(null)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedAttendeeForPayment, setSelectedAttendeeForPayment] = useState<Attendee | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>("COMPLETO")
  const [partialAmount, setPartialAmount] = useState("")
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [searchMemberQuery, setSearchMemberQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showCreateMember, setShowCreateMember] = useState(false)
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null)
  const [selectedSessionForScanner, setSelectedSessionForScanner] = useState<EventSession | null>(null)

  const event = mockEvent
  const sessions = mockSessions
  const attendees = mockAttendees
  const members = mockMembers

  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0)
  const totalRegistered = attendees.length
  const totalExpected = event.hasPrice ? totalRegistered * (event.price || 0) : 0
  const totalCollected = attendees.reduce((sum, a) => sum + a.amountPaid, 0)
  const collectionPercentage = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0

  const attendeesWithPayment = attendees.filter((a) => event.hasPrice)
  const avgPaymentPercentage =
    attendeesWithPayment.length > 0
      ? attendeesWithPayment.reduce((sum, a) => sum + ((a.amountPaid / (event.price || 1)) * 100), 0) /
        attendeesWithPayment.length
      : 0

  const paymentDistribution = {
    full: attendees.filter((a) => a.paidStatus === "COMPLETO").length,
    partial: attendees.filter((a) => a.paidStatus === "PARCIAL").length,
    pending: attendees.filter((a) => a.paidStatus === "PENDIENTE").length,
    exempt: attendees.filter((a) => a.paidStatus === "EXONERADO").length,
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      member.dni.includes(searchMemberQuery),
  )

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleGenerateQR = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setIsQRModalOpen(true)
  }

  const handleConfirmPayment = (attendee: Attendee) => {
    setSelectedAttendeeForPayment(attendee)
    setPaymentType("COMPLETO")
    setPartialAmount("")
    setPaymentReceiptFile(null)
    setIsPaymentModalOpen(true)
  }

  const handleRegisterPartialPayment = (attendee: Attendee) => {
    setSelectedAttendeeForPayment(attendee)
    setPaymentType("PARCIAL")
    setPartialAmount("")
    setPaymentReceiptFile(null)
    setIsPaymentModalOpen(true)
  }

  const handleSubmitPayment = () => {
    console.log("Registering payment:", {
      attendeeId: selectedAttendeeForPayment?.id,
      type: paymentType,
      amount: paymentType === "PARCIAL" ? partialAmount : event.price,
      receipt: paymentReceiptFile?.name,
    })
    setIsPaymentModalOpen(false)
  }

  const handleEditSession = (session: EventSession) => {
    setSelectedSession(session)
    setIsEditSessionModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.ministry}</p>
        </div>
        <Badge variant={statusColors[event.status as keyof typeof statusColors] as any}>{event.status}</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones ({sessions.length})</TabsTrigger>
          <TabsTrigger value="attendees">Asistentes ({attendees.length})</TabsTrigger>
          <TabsTrigger value="financial">Reporte Financiero</TabsTrigger>
          <TabsTrigger value="scanner">Escanear QR</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información del Evento</CardTitle>
                <Button variant="outline" onClick={() => setIsEditEventModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p>{event.description}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Responsable</Label>
                  <p>{event.responsible}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Ministerio</Label>
                  <p>{event.ministry}</p>
                </div>
                {event.hasPrice && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Precio por Asistente</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p>${(event.price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Total Sesiones</Label>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <p>{sessions.length} sesiones programadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegistered}</div>
                <p className="text-xs text-muted-foreground">Asistentes al evento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendees.filter((a) => a.status === "CONFIRMADO").length}</div>
                <p className="text-xs text-muted-foreground">Con QR generado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendees.filter((a) => a.status === "REGISTRADO").length}</div>
                <p className="text-xs text-muted-foreground">Sin confirmar</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab - Continuará en el siguiente archivo debido al tamaño */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sesiones del Evento</CardTitle>
                  <CardDescription>Gestiona las sesiones con ubicación, horario y capacidad</CardDescription>
                </div>
                <Button onClick={() => setIsAddSessionModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sesión
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{session.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDateTime(session.startDate)} - {formatDateTime(session.endDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {session.registered}/{session.capacity} asistentes
                              </span>
                            </div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${(session.registered / session.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditSession(session)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendees Tab */}
        <TabsContent value="attendees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Asistentes</CardTitle>
                  <CardDescription>Gestiona los asistentes registrados al evento</CardDescription>
                </div>
                <Button onClick={() => setIsAddAttendeeModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Asistente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asistente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Sesiones Asistidas</TableHead>
                      <TableHead>QR</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{attendee.member.name}</span>
                            <span className="text-xs text-muted-foreground">{attendee.member.dni}</span>
                          </div>
                        </TableCell>
                        <TableCell>{attendee.member.cell}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[attendee.status as keyof typeof statusColors] as any}>
                            {attendee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              paymentStatusColors[attendee.paidStatus as keyof typeof paymentStatusColors] as any
                            }
                          >
                            {attendee.paidStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>${attendee.amountPaid.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {attendee.sessionAttendance.length}/{sessions.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          {attendee.qrCode ? (
                            <Button variant="outline" size="sm" onClick={() => handleGenerateQR(attendee)}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver QR
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin QR</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {attendee.paidStatus !== "COMPLETO" && event.hasPrice && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleConfirmPayment(attendee)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Registrar Pago
                                </Button>
                                {attendee.paidStatus === "PENDIENTE" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRegisterPartialPayment(attendee)}
                                  >
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Abono
                                  </Button>
                                )}
                              </>
                            )}
                            {!attendee.qrCode && attendee.paidStatus === "COMPLETO" && (
                              <Button variant="outline" size="sm" onClick={() => handleGenerateQR(attendee)}>
                                <QrCode className="h-4 w-4 mr-2" />
                                Generar QR
                              </Button>
                            )}
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Collection Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progreso de Recaudación
                </CardTitle>
                <CardDescription>Dinero recaudado vs esperado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - collectionPercentage / 100)}`}
                        className="text-primary transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{Math.round(collectionPercentage)}%</span>
                      <span className="text-xs text-muted-foreground">Recaudado</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Recaudado:</span>
                    <span className="font-semibold text-primary">${totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Esperado:</span>
                    <span className="font-semibold">${totalExpected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Pendiente:</span>
                    <span className="font-semibold text-destructive">
                      ${(totalExpected - totalCollected).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Distribution Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución de Pagos
                </CardTitle>
                <CardDescription>Estado de pago de los asistentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - avgPaymentPercentage / 100)}`}
                        className="text-chart-2 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{Math.round(avgPaymentPercentage)}%</span>
                      <span className="text-xs text-muted-foreground">Promedio</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm">Pago Completo</span>
                    </div>
                    <span className="font-semibold">{paymentDistribution.full}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-2" />
                      <span className="text-sm">Pago Parcial</span>
                    </div>
                    <span className="font-semibold">{paymentDistribution.partial}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-sm">Pendiente</span>
                    </div>
                    <span className="font-semibold">{paymentDistribution.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted" />
                      <span className="text-sm">Exonerado</span>
                    </div>
                    <span className="font-semibold">{paymentDistribution.exempt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Payment List */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Pagos</CardTitle>
              <CardDescription>Lista completa de pagos por asistente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asistente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Monto Pagado</TableHead>
                      <TableHead>Porcentaje</TableHead>
                      <TableHead>Comprobante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendees.map((attendee) => {
                      const percentage = event.hasPrice ? ((attendee.amountPaid / (event.price || 1)) * 100) : 0
                      return (
                        <TableRow key={attendee.id}>
                          <TableCell className="font-medium">{attendee.member.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                paymentStatusColors[attendee.paidStatus as keyof typeof paymentStatusColors] as any
                              }
                            >
                              {attendee.paidStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>${attendee.amountPaid.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">{Math.round(percentage)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {attendee.receiptUrl ? (
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin comprobante</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escanear Código QR</CardTitle>
              <CardDescription>Selecciona la sesión y valida la asistencia escaneando el código QR</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar Sesión</Label>
                <Select
                  value={selectedSessionForScanner?.id?.toString()}
                  onValueChange={(value) => {
                    const session = sessions.find((s) => s.id.toString() === value)
                    setSelectedSessionForScanner(session || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.title} - {formatDateTime(session.startDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedSessionForScanner && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDateTime(selectedSessionForScanner.startDate)} -{" "}
                      {formatDateTime(selectedSessionForScanner.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSessionForScanner.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedSessionForScanner.registered}/{selectedSessionForScanner.capacity} registrados
                    </span>
                  </div>
                </div>
              )}
              {selectedSessionForScanner ? (
                <QRScanner eventId={id || ""} sessionId={selectedSessionForScanner.id} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CalendarDays className="h-16 w-16 mb-4 opacity-50" />
                  <p>Selecciona una sesión para comenzar a escanear</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals - Continuará en el siguiente mensaje debido al tamaño del archivo */}
      {/* Add Attendee Modal */}
      <Dialog open={isAddAttendeeModalOpen} onOpenChange={setIsAddAttendeeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Asistente</DialogTitle>
            <DialogDescription>Busca un miembro existente o crea uno nuevo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!showCreateMember ? (
              <>
                <div className="space-y-2">
                  <Label>Buscar Miembro</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o DNI..."
                      value={searchMemberQuery}
                      onChange={(e) => setSearchMemberQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {searchMemberQuery && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 ${
                            selectedMember?.id === member.id ? "bg-accent" : ""
                          }`}
                          onClick={() => setSelectedMember(member)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.dni} • {member.cell}
                              </p>
                            </div>
                            {selectedMember?.id === member.id && <CheckCircle className="h-5 w-5 text-primary" />}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <p>No se encontraron miembros</p>
                        <Button variant="link" onClick={() => setShowCreateMember(true)} className="mt-2">
                          Crear nuevo miembro
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {!searchMemberQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Busca un miembro para registrar</p>
                    <Button variant="link" onClick={() => setShowCreateMember(true)} className="mt-2">
                      O crea un nuevo miembro
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Crear Nuevo Miembro</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateMember(false)}>
                    Volver a búsqueda
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input placeholder="Nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input placeholder="Apellido" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Documento</Label>
                    <Input placeholder="1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label>Celular</Label>
                    <Input placeholder="3001234567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Nacimiento</Label>
                    <Input type="date" />
                  </div>
                </div>
              </div>
            )}
            {event.hasPrice && selectedMember && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Información de Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estado de Pago</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                        <SelectItem value="PARCIAL">Parcial</SelectItem>
                        <SelectItem value="COMPLETO">Completo</SelectItem>
                        <SelectItem value="EXONERADO">Exonerado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Pagado</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" placeholder="0" className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Comprobante de Pago (Opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {paymentReceipt && (
                      <Button variant="outline" size="icon" onClick={() => setPaymentReceipt(null)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {paymentReceipt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{paymentReceipt.name}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea placeholder="Información adicional sobre el pago..." rows={2} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAttendeeModalOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!selectedMember && !showCreateMember} onClick={() => setIsAddAttendeeModalOpen(false)}>
              {showCreateMember ? "Crear y Registrar" : "Registrar Asistente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR de Asistencia</DialogTitle>
            <DialogDescription>
              {selectedAttendee?.member.name} - {selectedAttendee?.qrCode}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={`/placeholder_svg.png?height=200&width=200&text=${selectedAttendee?.qrCode}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">Presenta este código QR al ingresar al evento</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRModalOpen(false)}>
              Cerrar
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              {selectedAttendeeForPayment?.member.name} - {paymentType === "COMPLETO" ? "Pago Completo" : "Abono"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Pago</Label>
              <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETO">Pago Completo</SelectItem>
                  <SelectItem value="PARCIAL">Pago Parcial (Abono)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monto</Label>
              {paymentType === "COMPLETO" ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">${(event.price || 0).toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-auto">Precio del evento</span>
                </div>
              ) : (
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Ingresa el monto del abono"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    className="pl-10"
                    max={event.price ? event.price - (selectedAttendeeForPayment?.amountPaid || 0) : undefined}
                  />
                </div>
              )}
              {paymentType === "PARCIAL" && selectedAttendeeForPayment && (
                <p className="text-xs text-muted-foreground">
                  Pagado: ${selectedAttendeeForPayment.amountPaid.toLocaleString()} / Pendiente: $
                  {((event.price || 0) - selectedAttendeeForPayment.amountPaid).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Comprobante de Pago (Opcional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentReceiptFile(e.target.files?.[0] || null)}
                    className="flex-1"
                    id="payment-receipt-upload"
                  />
                  {paymentReceiptFile && (
                    <Button variant="outline" size="icon" onClick={() => setPaymentReceiptFile(null)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {paymentReceiptFile && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{paymentReceiptFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(paymentReceiptFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Formatos aceptados: JPG, PNG, PDF (máx. 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label>Notas (Opcional)</Label>
              <Textarea placeholder="Información adicional sobre el pago..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={paymentType === "PARCIAL" && (!partialAmount || Number(partialAmount) <= 0)}
            >
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Session Modal */}
      <Dialog open={isAddSessionModalOpen} onOpenChange={setIsAddSessionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Sesión</DialogTitle>
            <DialogDescription>Crea una nueva sesión para el evento</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="session-title">Título de la Sesión</Label>
              <Input id="session-title" placeholder="Ej: Sesión de Apertura" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-start-date">Fecha Inicio</Label>
              <Input id="session-start-date" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-end-date">Fecha Fin</Label>
              <Input id="session-end-date" type="datetime-local" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="session-location">Ubicación</Label>
              <Input id="session-location" placeholder="Ej: Auditorio Principal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-capacity">Capacidad</Label>
              <Input id="session-capacity" type="number" placeholder="50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSessionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsAddSessionModalOpen(false)}>Crear Sesión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Modal */}
      <Dialog open={isEditSessionModalOpen} onOpenChange={setIsEditSessionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Sesión</DialogTitle>
            <DialogDescription>Actualiza la información de la sesión</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-session-title">Título de la Sesión</Label>
              <Input id="edit-session-title" defaultValue={selectedSession?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-session-start-date">Fecha Inicio</Label>
              <Input
                id="edit-session-start-date"
                type="datetime-local"
                defaultValue={selectedSession?.startDate?.slice(0, 16)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-session-end-date">Fecha Fin</Label>
              <Input
                id="edit-session-end-date"
                type="datetime-local"
                defaultValue={selectedSession?.endDate?.slice(0, 16)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-session-location">Ubicación</Label>
              <Input id="edit-session-location" defaultValue={selectedSession?.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-session-capacity">Capacidad</Label>
              <Input id="edit-session-capacity" type="number" defaultValue={selectedSession?.capacity} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSessionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsEditSessionModalOpen(false)}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

