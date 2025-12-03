import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Download, FileText, Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import type { WeeklyReport, Deposit, Egress } from "../types"

// Mock data
const mockWeeklyReports: WeeklyReport[] = [
  { id: 1, week: "Semana 1 - Enero 2025", date: "2025-01-01 - 2025-01-07", deposits: 2500000, egress: 800000 },
  { id: 2, week: "Semana 2 - Enero 2025", date: "2025-01-08 - 2025-01-14", deposits: 3200000, egress: 1200000 },
  { id: 3, week: "Semana 3 - Enero 2025", date: "2025-01-15 - 2025-01-21", deposits: 2800000, egress: 950000 },
  { id: 4, week: "Semana 4 - Enero 2025", date: "2025-01-22 - 2025-01-28", deposits: 3500000, egress: 1100000 },
]

const mockDeposits: Deposit[] = [
  { id: 1, donor: "Juan Pérez", dni: "1234567890", type: "Diezmo", amount: 500000, date: "2025-01-20", week: "Semana 3" },
  { id: 2, donor: "María García", dni: "0987654321", type: "Ofrenda", amount: 200000, date: "2025-01-21", week: "Semana 3" },
  { id: 3, donor: "Carlos López", dni: "1122334455", type: "Diezmo", amount: 350000, date: "2025-01-22", week: "Semana 4" },
]

const mockEgresses: Egress[] = [
  { id: 1, description: "Pago de servicios públicos", category: "Servicios", amount: 450000, date: "2025-01-15", week: "Semana 3" },
  { id: 2, description: "Compra de equipos de sonido", category: "Equipamiento", amount: 2500000, date: "2025-01-18", week: "Semana 3" },
  { id: 3, description: "Mantenimiento del templo", category: "Mantenimiento", amount: 800000, date: "2025-01-22", week: "Semana 4" },
]

export function ReportsPage() {
  const [weeklyReports] = useState<WeeklyReport[]>(mockWeeklyReports)
  const [deposits] = useState<Deposit[]>(mockDeposits)
  const [egresses] = useState<Egress[]>(mockEgresses)

  const totalDeposits = weeklyReports.reduce((acc, r) => acc + r.deposits, 0)
  const totalEgress = weeklyReports.reduce((acc, r) => acc + r.egress, 0)
  const balance = totalDeposits - totalEgress

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes Financieros</h1>
          <p className="text-muted-foreground">Gestiona los ingresos y egresos de la iglesia</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalDeposits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Enero 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalEgress.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Enero 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Enero 2025</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Reportes Semanales</TabsTrigger>
          <TabsTrigger value="deposits">Depósitos</TabsTrigger>
          <TabsTrigger value="egress">Egresos</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Semanales</CardTitle>
              <CardDescription>Resumen semanal de ingresos y egresos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semana</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Egresos</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyReports.map((report) => {
                    const weekBalance = report.deposits - report.egress
                    return (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.week}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{report.date}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ${report.deposits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">${report.egress.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${weekBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${weekBalance.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Depósitos</CardTitle>
                <CardDescription>Registro de todos los ingresos</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Depósito
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Semana</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.donor}</TableCell>
                      <TableCell>{deposit.type}</TableCell>
                      <TableCell className="text-green-600">${deposit.amount.toLocaleString()}</TableCell>
                      <TableCell>{deposit.date}</TableCell>
                      <TableCell>{deposit.week}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egress" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Egresos</CardTitle>
                <CardDescription>Registro de todos los gastos</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Egreso
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Semana</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {egresses.map((egress) => (
                    <TableRow key={egress.id}>
                      <TableCell className="font-medium">{egress.description}</TableCell>
                      <TableCell>{egress.category}</TableCell>
                      <TableCell className="text-red-600">${egress.amount.toLocaleString()}</TableCell>
                      <TableCell>{egress.date}</TableCell>
                      <TableCell>{egress.week}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

