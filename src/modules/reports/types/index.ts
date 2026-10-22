export interface DashboardMetrics {
  currentWeek: {
    id: string
    startDate: string
    endDate: string
    totalIncome: number
    totalEgress: number
    netBalance: number
    status: string
  }
  currentMonth: {
    id: string
    year: number
    month: number
    totalIncome: number
    totalEgress: number
    netBalance: number
    pettyCashTotal: number
    mainCashTotal: number
  }
  debtsSummary: {
    activeDebtsCount: number
    totalPendingDebt: number
  }
}

export interface SearchTitherResult {
  memberId: string
  name: string
  dni: string
  tipoDni?: string
  cell: string
  direccion?: string
  titherId: string | null
  titherCode: string | null
  isRegisteredTither: boolean
}

export interface Tither {
  id: string
  memberId: string
  titherCode?: string
  name: string
  dni: string
  cell: string
  registrationDate: string
  totalDepositsCount: number
}

export interface OfferingSession {
  id: string
  sessionName: string
  sessionDate: string
  totalOfferingCash: number
  totalTithesCash: number
  totalSpecialOfferings?: number
  grandTotal: number
  notes?: string
  createdBy?: string
  depositsCount?: number
  deposits?: Deposit[]
}

export interface CreateOfferingSessionData {
  session_name: string
  session_date: string
  total_offering_cash: number
  total_special_offerings?: number
  notes?: string
  meeting_session_id?: string
}

export interface Deposit {
  id: string
  donorName: string
  donorId?: string
  type: string
  paymentMethod: string
  value: number
  date: string
  envelopeImageUrl?: string
  notes?: string
  sessionName?: string
  tither?: {
    id: string
    name: string
  }
}

export interface CreateDepositData {
  donor_name: string
  donor_id?: string
  type_donor_id?: string
  type: string
  payment_method?: string
  value: number
  date: string
  notes?: string
  offering_session_id?: string
  tither_id?: string
  envelope_image?: File
  // Para crear miembro diezmador inline
  new_member?: {
    name: string
    last_name?: string
    dni_user?: string
    tipo_dni?: string
    cell?: string
    direccion?: string
  }
}

export interface Egress {
  id: string
  description: string
  category: string
  fundType: "CAJA_MENOR" | "CAJA_MAYOR"
  value: number
  date: string
  voucherUrl?: string
  debt?: {
    id: string
    creditor: string
    currentBalance: number
  }
}

export interface CreateEgressData {
  description: string
  category: string
  value: number
  date: string
  debt_id?: string
  receipt_image?: File
}

export interface Debt {
  id: string
  creditorName: string
  concept: string
  totalAmount: number
  currentBalance: number
  dueDate?: string
  status: "PENDING" | "PARTIAL" | "PAID"
  paymentsCount: number
}

export interface CreateDebtData {
  creditor_name: string
  concept: string
  total_amount: number
  due_date?: string
  notes?: string
}

export interface WeeklyReport {
  id: string
  date: string
  weekStartDate: string
  weekEndDate: string
  totalIncome: number
  totalEgress: number
  netBalance: number
  status: "ABIERTO" | "CERRADO_PENDIENTE_FIRMA" | "CERRADO_Y_FIRMADO"
  witnessName?: string
  witnessSignedAt?: string
  witnessSignatureUrl?: string
  witnessSecurityHash?: string
  depositsCount?: number
  egressesCount?: number
  deposits?: Deposit[]
  egresses?: Egress[]
  offeringSessions?: OfferingSession[]
}

export interface MonthlyReport {
  id: string
  year: number
  month: number
  date: string
  totalIncome: number
  totalEgress: number
  netBalance: number
  status: string
  weeksCount?: number
  weeklyReports?: WeeklyReport[]
}
