import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import {
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Camera,
  FileCheck,
  Send,
  CreditCard,
  Building,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { reportsService } from "../services/reports.service"
import type {
  DashboardMetrics,
  WeeklyReport,
  Deposit,
  Egress,
  Debt,
  OfferingSession,
  SearchTitherResult,
} from "../types"

export function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [currentWeek, setCurrentWeek] = useState<WeeklyReport | null>(null)
  const [sessions, setSessions] = useState<OfferingSession[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [egresses, setEgresses] = useState<Egress[]>([])
  const [debts, setDebts] = useState<Debt[]>([])

  // Modales
  const [openSessionModal, setOpenSessionModal] = useState(false)
  const [openDepositModal, setOpenDepositModal] = useState(false)
  const [openEgressModal, setOpenEgressModal] = useState(false)
  const [openDebtModal, setOpenDebtModal] = useState(false)
  const [openSignatureModal, setOpenSignatureModal] = useState(false)
  const [signatureLoading, setSignatureLoading] = useState(false)

  // Formulario Sesión de Conteo
  const [sessionForm, setSessionForm] = useState({
    session_name: "Culto Domingo Mañana",
    session_date: new Date().toISOString().split("T")[0],
    total_offering_cash: "",
    notes: "",
  })

  // Formulario Ingresos / Diezmos
  const [depositForm, setDepositForm] = useState({
    type: "DIEZMO",
    value: "",
    date: new Date().toISOString().split("T")[0],
    donor_name: "",
    donor_id: "",
    notes: "",
    offering_session_id: "",
    tither_id: "",
  })
  const [envelopeFile, setEnvelopeFile] = useState<File | null>(null)
  const [titherQuery, setTitherQuery] = useState("")
  const [titherSearchResults, setTitherSearchResults] = useState<SearchTitherResult[]>([])
  const [searchingTithers, setSearchingTithers] = useState(false)
  const [isCreatingNewTither, setIsCreatingNewTither] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    last_name: "",
    dni_user: "",
    cell: "",
    direccion: "",
  })

  // Formulario Egresos
  const [egressForm, setEgressForm] = useState({
    description: "",
    category: "SERVICIOS",
    value: "",
    date: new Date().toISOString().split("T")[0],
    debt_id: "",
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  // Formulario Deudas
  const [debtForm, setDebtForm] = useState({
    creditor_name: "",
    concept: "",
    total_amount: "",
    due_date: "",
    notes: "",
  })

  // Cargar datos
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashMetrics, week, sess, deps, egs, dbs] = await Promise.all([
        reportsService.getDashboard(),
        reportsService.getCurrentWeeklyReport(),
        reportsService.getOfferingSessions(),
        reportsService.getDeposits(),
        reportsService.getEgresses(),
        reportsService.getDebts(),
      ])
      setMetrics(dashMetrics)
      setCurrentWeek(week)
      setSessions(sess.sessions || [])
      setDeposits(deps.deposits || [])
      setEgresses(egs.egresses || [])
      setDebts(dbs || [])
    } catch (err: any) {
      console.error(err)
      toast.error("Error al cargar datos contables")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Búsqueda de diezmadores con debounce
  useEffect(() => {
    if (!titherQuery.trim() || titherQuery.length < 2) {
      setTitherSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingTithers(true)
        const res = await reportsService.searchTithers(titherQuery)
        setTitherSearchResults(res)
      } catch (err) {
        console.error(err)
      } finally {
        setSearchingTithers(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [titherQuery])

  // Handlers para guardar
  const handleCreateSession = async () => {
    if (!sessionForm.session_name || !sessionForm.total_offering_cash) {
      toast.error("Por favor completa los campos requeridos")
      return
    }
    try {
      await reportsService.createOfferingSession({
        session_name: sessionForm.session_name,
        session_date: sessionForm.session_date,
        total_offering_cash: Number(sessionForm.total_offering_cash),
        notes: sessionForm.notes,
      })
      toast.success("Sesión de conteo iniciada exitosamente")
      setOpenSessionModal(false)
      loadDashboardData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al crear sesión")
    }
  }

  const handleCreateDeposit = async () => {
    if (!depositForm.donor_name || !depositForm.value) {
      toast.error("Por favor ingresa el donante y monto")
      return
    }

    try {
      await reportsService.createDeposit({
        donor_name: depositForm.donor_name,
        donor_id: depositForm.donor_id,
        type: depositForm.type,
        value: Number(depositForm.value),
        date: depositForm.date,
        notes: depositForm.notes,
        offering_session_id: depositForm.offering_session_id || undefined,
        tither_id: depositForm.tither_id || undefined,
        envelope_image: envelopeFile || undefined,
        new_member: isCreatingNewTither ? newMemberForm : undefined,
      })

      toast.success("Ingreso registrado exitosamente")
      setOpenDepositModal(false)
      setEnvelopeFile(null)
      setIsCreatingNewTither(false)
      setDepositForm({
        type: "DIEZMO",
        value: "",
        date: new Date().toISOString().split("T")[0],
        donor_name: "",
        donor_id: "",
        notes: "",
        offering_session_id: "",
        tither_id: "",
      })
      loadDashboardData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al registrar ingreso")
    }
  }

  const handleCreateEgress = async () => {
    if (!egressForm.description || !egressForm.value) {
      toast.error("Por favor completa la descripción y valor del egreso")
      return
    }

    try {
      await reportsService.createEgress({
        description: egressForm.description,
        category: egressForm.category,
        value: Number(egressForm.value),
        date: egressForm.date,
        debt_id: egressForm.debt_id || undefined,
        receipt_image: receiptFile || undefined,
      })

      toast.success("Egreso registrado exitosamente")
      setOpenEgressModal(false)
      setReceiptFile(null)
      setEgressForm({
        description: "",
        category: "SERVICIOS",
        value: "",
        date: new Date().toISOString().split("T")[0],
        debt_id: "",
      })
      loadDashboardData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al registrar egreso")
    }
  }

  const handleCreateDebt = async () => {
    if (!debtForm.creditor_name || !debtForm.concept || !debtForm.total_amount) {
      toast.error("Por favor completa los campos de la cuenta por pagar")
      return
    }

    try {
      await reportsService.createDebt({
        creditor_name: debtForm.creditor_name,
        concept: debtForm.concept,
        total_amount: Number(debtForm.total_amount),
        due_date: debtForm.due_date || undefined,
        notes: debtForm.notes,
      })

      toast.success("Cuenta por pagar registrada exitosamente")
      setOpenDebtModal(false)
      setDebtForm({
        creditor_name: "",
        concept: "",
        total_amount: "",
        due_date: "",
        notes: "",
      })
      loadDashboardData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al registrar deuda")
    }
  }

  const handleRequestSignature = async () => {
    if (!currentWeek) return
    try {
      setSignatureLoading(true)
      const res = await reportsService.requestWitnessSignature(currentWeek.id)
      toast.success(`Firma solicitada al testigo ${res.witness?.name || ""}. Notificación enviada.`)
      setOpenSignatureModal(false)
      loadDashboardData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al solicitar firma")
    } finally {
      setSignatureLoading(false)
    }
  }

  const handleExportWeeklyExcel = async () => {
    if (!currentWeek) return
    try {
      toast.info("Generando archivo Excel...")
      const blob = await reportsService.exportWeeklyExcel(currentWeek.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte_semanal_${currentWeek.id}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast.success("Reporte descargado exitosamente")
    } catch (err) {
      toast.error("Error al exportar reporte Excel")
    }
  }

  const handleExportWeeklyPdf = async () => {
    if (!currentWeek) return
    try {
      toast.info("Generando PDF oficial del balance semanal...")
      const blob = await reportsService.exportWeeklyPdf(currentWeek.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `balance_semanal_${currentWeek.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast.success("PDF oficial descargado exitosamente")
    } catch (err) {
      toast.error("Error al exportar balance en PDF")
    }
  }

  const handleExportSessionPdf = async (sessionId: string) => {
    try {
      toast.info("Generando informe de conteo de culto en PDF...")
      const blob = await reportsService.exportOfferingSessionPdf(sessionId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `informe_conteo_culto_${sessionId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast.success("Informe de conteo descargado exitosamente")
    } catch (err) {
      toast.error("Error al exportar informe de conteo")
    }
  }

  // Previsualización dinámica de Caja Menor vs Caja Mayor
  const numericEgressValue = Number(egressForm.value) || 0
  const isCajaMayor = numericEgressValue > 70000

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contabilidad y Finanzas</h1>
          <p className="text-muted-foreground text-sm">
            Gestión integral de diezmos, ofrendas, egresos con arqueo de cajas y auditoría de firmas.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWeeklyExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel Semanal
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWeeklyPdf}>
            <FileCheck className="h-4 w-4 mr-2 text-primary" />
            PDF Semanal
          </Button>
          <Button size="sm" onClick={() => setOpenSessionModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Conteo de Culto
          </Button>
        </div>
      </div>

      {/* Tarjetas Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-700">
              ${(metrics?.currentMonth.totalIncome || 0).toLocaleString("es-CO")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Semana actual: ${(metrics?.currentWeek.totalIncome || 0).toLocaleString("es-CO")}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Egresos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-700">
              ${(metrics?.currentMonth.totalEgress || 0).toLocaleString("es-CO")}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50">
                Menor: ${(metrics?.currentMonth.pettyCashTotal || 0).toLocaleString("es-CO")}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50">
                Mayor: ${(metrics?.currentMonth.mainCashTotal || 0).toLocaleString("es-CO")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Balance Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-black ${
                (metrics?.currentMonth.netBalance || 0) >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              ${(metrics?.currentMonth.netBalance || 0).toLocaleString("es-CO")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Suma acumulada del mes en curso</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Deudas / Pasivos</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-700">
              ${(metrics?.debtsSummary.totalPendingDebt || 0).toLocaleString("es-CO")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.debtsSummary.activeDebtsCount || 0} compras a crédito activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Banner de Auditoría Semanal */}
      {currentWeek && (
        <Card className="bg-slate-900 text-white shadow-md border-0">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    currentWeek.status === "CERRADO_Y_FIRMADO"
                      ? "bg-green-600 text-white hover:bg-green-600"
                      : currentWeek.status === "CERRADO_PENDIENTE_FIRMA"
                      ? "bg-amber-600 text-white hover:bg-amber-600"
                      : "bg-blue-600 text-white hover:bg-blue-600"
                  }
                >
                  {currentWeek.status === "CERRADO_Y_FIRMADO"
                    ? "Semana Firmada y Cerrada"
                    : currentWeek.status === "CERRADO_PENDIENTE_FIRMA"
                    ? "Cerrada - Pendiente Firma"
                    : "Semana Abierta en Curso"}
                </Badge>
                <span className="text-xs text-slate-300">
                  {currentWeek.weekStartDate} al {currentWeek.weekEndDate}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {currentWeek.witnessName ? (
                  <>
                    Testigo asignado: <strong className="text-white">{currentWeek.witnessName}</strong>
                    {currentWeek.witnessSignedAt && (
                      <span className="text-green-400 ml-2">✓ Firmó el {currentWeek.witnessSignedAt}</span>
                    )}
                  </>
                ) : (
                  "Aún no se ha solicitado firma de testigo activo para esta semana."
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentWeek.status !== "CERRADO_Y_FIRMADO" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpenSignatureModal(true)}
                  className="font-semibold shadow"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Solicitar Firma por WhatsApp
                </Button>
              ) : (
                <Badge variant="outline" className="text-green-300 border-green-400/50 py-1 px-3">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" /> Auditoría Completa
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Principales */}
      <Tabs defaultValue="deposits" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="deposits">Diezmos y Ofrendas</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones de Culto</TabsTrigger>
          <TabsTrigger value="egresses">Egresos y Caja</TabsTrigger>
          <TabsTrigger value="debts">Cuentas por Pagar</TabsTrigger>
        </TabsList>

        {/* TAB 1: INGRESOS Y DIEZMOS */}
        <TabsContent value="deposits" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Registro de Diezmos y Ofrendas</h2>
              <p className="text-xs text-muted-foreground">Historial detallado con comprobantes de sobres físicos.</p>
            </div>
            <Button onClick={() => setOpenDepositModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Registrar Diezmo / Ofrenda
            </Button>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Donante / Diezmador</TableHead>
                    <TableHead>Sesión Culto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Sobre Físico</TableHead>
                    <TableHead className="text-right">Monto ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay ingresos registrados para el periodo actual.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deposits.map((dep) => (
                      <TableRow key={dep.id}>
                        <TableCell className="text-xs font-medium">{dep.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              dep.type === "DIEZMO"
                                ? "default"
                                : dep.type === "OFRENDA_ESPECIAL"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {dep.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {dep.donorName}
                          {dep.donorId && <span className="text-xs text-muted-foreground block">CC: {dep.donorId}</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {dep.sessionName || "Ingreso suelto"}
                        </TableCell>
                        <TableCell className="text-xs">{dep.paymentMethod}</TableCell>
                        <TableCell>
                          {dep.envelopeImageUrl ? (
                            <a
                              href={dep.envelopeImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver Sobre
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin foto</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          ${dep.value.toLocaleString("es-CO")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SESIONES DE CONTEO */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Sesiones de Conteo de Culto</h2>
              <p className="text-xs text-muted-foreground">Informes automáticos generados tras cada reunión o culto.</p>
            </div>
            <Button onClick={() => setOpenSessionModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nueva Sesión de Conteo
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {sessions.map((sess) => (
              <Card key={sess.id} className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold text-slate-900">{sess.sessionName}</CardTitle>
                    <Badge variant="outline">{sess.sessionDate}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-muted-foreground">Ofrenda en Efectivo:</span>
                    <span className="font-semibold">${sess.totalOfferingCash.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-muted-foreground">Diezmos del Culto:</span>
                    <span className="font-semibold text-green-700">
                      ${sess.totalTithesCash.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t pt-2 font-bold">
                    <span>Total Recaudado:</span>
                    <span className="text-primary font-extrabold">${sess.grandTotal.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => handleExportSessionPdf(sess.id)}
                    >
                      <FileCheck className="h-3.5 w-3.5 mr-1 text-primary" /> Descargar Informe PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: EGRESOS Y CAJA */}
        <TabsContent value="egresses" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Egresos y Gastos de Iglesia</h2>
              <p className="text-xs text-muted-foreground">
                Arriendo, honorarios pastorales, servicios públicos y caja menor ($\le \$70.000$) vs mayor.
              </p>
            </div>
            <Button onClick={() => setOpenEgressModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Registrar Egreso
            </Button>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo de Caja</TableHead>
                    <TableHead>Soporte</TableHead>
                    <TableHead className="text-right">Monto ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {egresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay egresos registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    egresses.map((eg) => (
                      <TableRow key={eg.id}>
                        <TableCell className="text-xs font-medium">{eg.date}</TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {eg.description}
                          {eg.debt && (
                            <span className="text-xs text-orange-600 block">
                              Abono a deuda: {eg.debt.creditor}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{eg.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              eg.fundType === "CAJA_MAYOR"
                                ? "bg-blue-600 text-white"
                                : "bg-amber-600 text-white"
                            }
                          >
                            {eg.fundType === "CAJA_MAYOR" ? "Caja Mayor (>70k)" : "Caja Menor (≤70k)"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {eg.voucherUrl ? (
                            <a
                              href={eg.voucherUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" /> Factura
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin soporte</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-700">
                          ${eg.value.toLocaleString("es-CO")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: DEUDAS / CUENTAS POR PAGAR */}
        <TabsContent value="debts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Cuentas por Pagar (Compras a Crédito)</h2>
              <p className="text-xs text-muted-foreground">
                Control de pasivos con amortización automática al registrar egresos.
              </p>
            </div>
            <Button onClick={() => setOpenDebtModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nueva Cuenta por Pagar
            </Button>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acreedor</TableHead>
                    <TableHead>Concepto de Compra</TableHead>
                    <TableHead>Total Deuda</TableHead>
                    <TableHead>Saldo Pendiente</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay deudas o cuentas por pagar pendientes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    debts.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-bold text-slate-800">{d.creditorName}</TableCell>
                        <TableCell>{d.concept}</TableCell>
                        <TableCell className="font-semibold">${d.totalAmount.toLocaleString("es-CO")}</TableCell>
                        <TableCell className="font-extrabold text-orange-700">
                          ${d.currentBalance.toLocaleString("es-CO")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.dueDate || "Sin fecha fija"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              d.status === "PAID"
                                ? "bg-green-600 text-white"
                                : d.status === "PARTIAL"
                                ? "bg-amber-600 text-white"
                                : "bg-red-600 text-white"
                            }
                          >
                            {d.status === "PAID" ? "Pagada" : d.status === "PARTIAL" ? "Abonada" : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: NUEVA SESIÓN DE CONTEO */}
      <Dialog open={openSessionModal} onOpenChange={setOpenSessionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Sesión de Conteo de Culto</DialogTitle>
            <DialogDescription>Abre el conteo de ofrenda tras la reunión para registrar los montos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre del Culto / Reunión</Label>
              <Input
                value={sessionForm.session_name}
                onChange={(e) => setSessionForm({ ...sessionForm, session_name: e.target.value })}
                placeholder="Ej. Culto Dominical Mañana"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={sessionForm.session_date}
                onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Monto Global Ofrenda en Efectivo ($)</Label>
              <Input
                type="number"
                value={sessionForm.total_offering_cash}
                onChange={(e) => setSessionForm({ ...sessionForm, total_offering_cash: e.target.value })}
                placeholder="Ej. 650000"
              />
            </div>
            <div className="space-y-2">
              <Label>Observaciones (Opcional)</Label>
              <Input
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                placeholder="Notas sobre el conteo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSessionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSession}>Iniciar y Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: REGISTRAR DIEZMO / INGRESO */}
      <Dialog open={openDepositModal} onOpenChange={setOpenDepositModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Diezmo u Ofrenda</DialogTitle>
            <DialogDescription>
              Selecciona o busca al diezmador entre los miembros y adjunta la foto del sobre físico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de Ingreso</Label>
              <div className="flex gap-2">
                {["DIEZMO", "OFRENDA_ESPECIAL", "OTRO"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={depositForm.type === t ? "default" : "outline"}
                    onClick={() => setDepositForm({ ...depositForm, type: t })}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            {/* Búsqueda reactiva de diezmador */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between items-center">
                <Label>Buscar Miembro Diezmador</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreatingNewTither(!isCreatingNewTither)}
                  className="text-xs text-primary"
                >
                  {isCreatingNewTither ? "Cancelar nuevo miembro" : "+ Crear nuevo diezmador"}
                </Button>
              </div>

              {!isCreatingNewTither ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cédula, celular o nombre..."
                      value={titherQuery}
                      onChange={(e) => setTitherQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {searchingTithers && <p className="text-xs text-muted-foreground">Buscando miembros...</p>}

                  {titherSearchResults.length > 0 && (
                    <div className="border rounded-md max-h-36 overflow-y-auto divide-y bg-slate-50 text-xs">
                      {titherSearchResults.map((m) => (
                        <div
                          key={m.memberId}
                          className="p-2 cursor-pointer hover:bg-slate-200 flex justify-between items-center"
                          onClick={() => {
                            setDepositForm({
                              ...depositForm,
                              donor_name: m.name,
                              donor_id: m.dni,
                              tither_id: m.titherId || "",
                            })
                            setTitherSearchResults([])
                            setTitherQuery(m.name)
                          }}
                        >
                          <div>
                            <span className="font-semibold block">{m.name}</span>
                            <span className="text-muted-foreground">
                              CC: {m.dni || "N/A"} - Cel: {m.cell || "N/A"}
                            </span>
                          </div>
                          {m.isRegisteredTither ? (
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">
                              Diezmador
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Miembro
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {depositForm.donor_name && (
                    <div className="p-2 bg-green-50 rounded border border-green-200 text-xs">
                      Seleccionado: <strong>{depositForm.donor_name}</strong> (CC: {depositForm.donor_id || "N/A"})
                    </div>
                  )}
                </div>
              ) : (
                /* Formulario inline para nuevo miembro */
                <div className="bg-slate-50 p-3 rounded-lg border space-y-3 text-xs">
                  <p className="font-semibold text-slate-800">Datos del Nuevo Miembro Diezmador:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Nombre"
                      value={newMemberForm.name}
                      onChange={(e) => {
                        setNewMemberForm({ ...newMemberForm, name: e.target.value })
                        setDepositForm({ ...depositForm, donor_name: `${e.target.value} ${newMemberForm.last_name}` })
                      }}
                    />
                    <Input
                      placeholder="Apellidos"
                      value={newMemberForm.last_name}
                      onChange={(e) => {
                        setNewMemberForm({ ...newMemberForm, last_name: e.target.value })
                        setDepositForm({ ...depositForm, donor_name: `${newMemberForm.name} ${e.target.value}` })
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Número de Cédula / DNI"
                      value={newMemberForm.dni_user}
                      onChange={(e) => {
                        setNewMemberForm({ ...newMemberForm, dni_user: e.target.value })
                        setDepositForm({ ...depositForm, donor_id: e.target.value })
                      }}
                    />
                    <Input
                      placeholder="Celular (ej. 3001234567)"
                      value={newMemberForm.cell}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, cell: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Dirección de residencia"
                    value={newMemberForm.direccion}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, direccion: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="space-y-2">
                <Label>Monto en Pesos ($)</Label>
                <Input
                  type="number"
                  placeholder="Ej. 150000"
                  value={depositForm.value}
                  onChange={(e) => setDepositForm({ ...depositForm, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={depositForm.date}
                  onChange={(e) => setDepositForm({ ...depositForm, date: e.target.value })}
                />
              </div>
            </div>

            {/* Sesión de culto vinculada */}
            {sessions.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular a Sesión de Culto (Opcional)</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={depositForm.offering_session_id}
                  onChange={(e) => setDepositForm({ ...depositForm, offering_session_id: e.target.value })}
                >
                  <option value="">Ingreso suelto de semana</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sessionName} ({s.sessionDate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Foto del sobre físico */}
            <div className="space-y-2 border-t pt-3">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Foto / Escaneo del Sobre Físico
              </Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setEnvelopeFile(e.target.files?.[0] || null)}
              />
              <p className="text-[11px] text-muted-foreground">
                Se guardará de forma segura en MinIO S3 y formará parte del anexo fotográfico del reporte semanal.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDepositModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDeposit}>Guardar Ingreso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: REGISTRAR EGRESO */}
      <Dialog open={openEgressModal} onOpenChange={setOpenEgressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Egreso o Gasto</DialogTitle>
            <DialogDescription>Ingresa los detalles del pago. El sistema clasifica la caja según el monto.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Descripción del Gasto</Label>
              <Input
                placeholder="Ej. Pago de arriendo del templo / Factura de luz"
                value={egressForm.description}
                onChange={(e) => setEgressForm({ ...egressForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={egressForm.category}
                  onChange={(e) => setEgressForm({ ...egressForm, category: e.target.value })}
                >
                  <option value="ARRIENDO">Arriendo</option>
                  <option value="HONORARIOS_PASTOR">Honorarios al Pastor</option>
                  <option value="LUZ">Luz Eléctrica</option>
                  <option value="AGUA">Agua</option>
                  <option value="INTERNET">Internet</option>
                  <option value="SERVICIOS">Otros Servicios</option>
                  <option value="DEUDA">Abono a Deuda</option>
                  <option value="VARIOS">Gastos Varios</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={egressForm.date}
                  onChange={(e) => setEgressForm({ ...egressForm, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Valor del Pago ($)</Label>
                <Badge className={isCajaMayor ? "bg-blue-600 text-white" : "bg-amber-600 text-white"}>
                  {isCajaMayor ? "Caja Mayor / General (> $70.000)" : "Caja Menor (≤ $70.000)"}
                </Badge>
              </div>
              <Input
                type="number"
                placeholder="Ej. 45000"
                value={egressForm.value}
                onChange={(e) => setEgressForm({ ...egressForm, value: e.target.value })}
              />
            </div>

            {/* Selector de Deuda si la categoría es Deuda o hay deudas activas */}
            {debts.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <Label>Amortizar Cuenta por Pagar (Opcional)</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={egressForm.debt_id}
                  onChange={(e) => setEgressForm({ ...egressForm, debt_id: e.target.value })}
                >
                  <option value="">No amortizar deuda</option>
                  {debts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.creditorName} - {d.concept} (Saldo: ${d.currentBalance.toLocaleString("es-CO")})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Factura / Recibo */}
            <div className="space-y-2 border-t pt-3">
              <Label>Soporte / Factura / Recibo</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEgressModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEgress}>Guardar Egreso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: NUEVA DEUDA */}
      <Dialog open={openDebtModal} onOpenChange={setOpenDebtModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Cuenta por Pagar</DialogTitle>
            <DialogDescription>Registra compras a crédito para control de saldo pendiente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre del Acreedor / Proveedor</Label>
              <Input
                placeholder="Ej. Almacén de Sonido / Propietario Templo"
                value={debtForm.creditor_name}
                onChange={(e) => setDebtForm({ ...debtForm, creditor_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Concepto de la Compra</Label>
              <Input
                placeholder="Ej. Compra de consola de audio a cuotas"
                value={debtForm.concept}
                onChange={(e) => setDebtForm({ ...debtForm, concept: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Monto Total ($)</Label>
                <Input
                  type="number"
                  placeholder="Ej. 2500000"
                  value={debtForm.total_amount}
                  onChange={(e) => setDebtForm({ ...debtForm, total_amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha Límite</Label>
                <Input
                  type="date"
                  value={debtForm.due_date}
                  onChange={(e) => setDebtForm({ ...debtForm, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDebtModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDebt}>Registrar Deuda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: SOLICITAR FIRMA AL TESTIGO */}
      <Dialog open={openSignatureModal} onOpenChange={setOpenSignatureModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Firma Electrónica</DialogTitle>
            <DialogDescription>
              El sistema elegirá automáticamente a un miembro activo de la iglesia al azar y le enviará el enlace de
              auditoría legal a su WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-2">
            <p className="text-slate-700">
              Al confirmar, el testigo recibirá un enlace seguro donde podrá verificar el balance total de ingresos y
              egresos, y firmar desde su teléfono móvil.
            </p>
            <p className="text-xs text-muted-foreground">
              Se registrará su firma, dirección IP y se creará un sello criptográfico SHA-256 inmutable.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSignatureModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestSignature} disabled={signatureLoading}>
              {signatureLoading ? "Enviando enlace..." : "Enviar a WhatsApp del Testigo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
