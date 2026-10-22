import { axiosInstance } from "@/shared/api/axios.config"
import { API_ENDPOINTS } from "@/shared/api/enpoints"
import type {
  DashboardMetrics,
  SearchTitherResult,
  Tither,
  OfferingSession,
  CreateOfferingSessionData,
  Deposit,
  CreateDepositData,
  Egress,
  CreateEgressData,
  Debt,
  CreateDebtData,
  WeeklyReport,
  MonthlyReport,
} from "../types"

export const reportsService = {
  // Dashboard
  async getDashboard(): Promise<DashboardMetrics> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.DASHBOARD)
    return res.data.data
  },

  // Diezmadores
  async searchTithers(query: string): Promise<SearchTitherResult[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.TITHERS_SEARCH, {
      params: { q: query },
    })
    return res.data.data
  },

  async createTither(data: any): Promise<Tither> {
    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.TITHERS, data)
    return res.data.data
  },

  async getTithers(page = 1, search?: string): Promise<{ total: number; tithers: Tither[] }> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.TITHERS, {
      params: { page, search },
    })
    return res.data.data
  },

  // Sesiones de Conteo de Culto
  async createOfferingSession(data: CreateOfferingSessionData): Promise<OfferingSession> {
    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.SESSIONS, data)
    return res.data.data
  },

  async getOfferingSession(id: string): Promise<OfferingSession> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.SESSION_DETAIL(id))
    return res.data.data
  },

  async getOfferingSessions(weeklyReportId?: string): Promise<{ total: number; sessions: OfferingSession[] }> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.SESSIONS, {
      params: { weeklyReportId },
    })
    return res.data.data
  },

  // Depósitos e Ingresos
  async createDeposit(data: CreateDepositData): Promise<Deposit> {
    const formData = new FormData()
    formData.append("donor_name", data.donor_name)
    if (data.donor_id) formData.append("donor_id", data.donor_id)
    if (data.type_donor_id) formData.append("type_donor_id", data.type_donor_id)
    formData.append("type", data.type)
    if (data.payment_method) formData.append("payment_method", data.payment_method)
    formData.append("value", String(data.value))
    formData.append("date", data.date)
    if (data.notes) formData.append("notes", data.notes)
    if (data.offering_session_id) formData.append("offering_session_id", data.offering_session_id)
    if (data.tither_id) formData.append("tither_id", data.tither_id)
    if (data.envelope_image) formData.append("envelope_image", data.envelope_image)
    if (data.new_member) formData.append("new_member", JSON.stringify(data.new_member))

    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.DEPOSITS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },

  async getDeposits(params?: {
    weeklyReportId?: string
    offeringSessionId?: string
    type?: string
    page?: number
  }): Promise<{ total: number; deposits: Deposit[] }> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.DEPOSITS, { params })
    return res.data.data
  },

  async deleteDeposit(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.FINANCES.DEPOSIT_DELETE(id))
  },

  // Egresos y Gastos
  async createEgress(data: CreateEgressData): Promise<Egress> {
    const formData = new FormData()
    formData.append("description", data.description)
    formData.append("category", data.category)
    formData.append("value", String(data.value))
    formData.append("date", data.date)
    if (data.debt_id) formData.append("debt_id", data.debt_id)
    if (data.receipt_image) formData.append("receipt_image", data.receipt_image)

    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.EGRESSES, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data
  },

  async getEgresses(params?: {
    weeklyReportId?: string
    category?: string
    fundType?: string
    page?: number
  }): Promise<{ total: number; egresses: Egress[] }> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.EGRESSES, { params })
    return res.data.data
  },

  async deleteEgress(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.FINANCES.EGRESS_DELETE(id))
  },

  // Deudas
  async createDebt(data: CreateDebtData): Promise<Debt> {
    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.DEBTS, data)
    return res.data.data
  },

  async getDebts(status?: string): Promise<Debt[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.DEBTS, { params: { status } })
    return res.data.data
  },

  // Reportes Semanales
  async getCurrentWeeklyReport(): Promise<WeeklyReport> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.WEEKLY_CURRENT)
    return res.data.data
  },

  async getWeeklyReport(id: string): Promise<WeeklyReport> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.WEEKLY_DETAIL(id))
    return res.data.data
  },

  async getWeeklyReports(year?: number, month?: number): Promise<{ total: number; reports: WeeklyReport[] }> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.WEEKLY_LIST, {
      params: { year, month },
    })
    return res.data.data
  },

  async requestWitnessSignature(reportId: string, memberId?: string): Promise<any> {
    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.WEEKLY_REQUEST_SIGNATURE(reportId), {
      memberId,
    })
    return res.data
  },

  async exportWeeklyExcel(reportId: string): Promise<Blob> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.WEEKLY_EXPORT_EXCEL(reportId), {
      responseType: "blob",
    })
    return res.data
  },

  async exportWeeklyPdf(reportId: string): Promise<Blob> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.WEEKLY_EXPORT_PDF(reportId), {
      responseType: "blob",
    })
    return res.data
  },

  async exportOfferingSessionPdf(sessionId: string): Promise<Blob> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.SESSION_EXPORT_PDF(sessionId), {
      responseType: "blob",
    })
    return res.data
  },

  // Reportes Mensuales
  async getMonthlyReports(year?: number): Promise<MonthlyReport[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.MONTHLY_LIST, { params: { year } })
    return res.data.data
  },

  async getMonthlyReport(id: string): Promise<MonthlyReport> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.MONTHLY_DETAIL(id))
    return res.data.data
  },

  async exportMonthlyExcel(reportId: string): Promise<Blob> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.MONTHLY_EXPORT_EXCEL(reportId), {
      responseType: "blob",
    })
    return res.data
  },

  // Firma Pública
  async getSigningReportData(token: string): Promise<any> {
    const res = await axiosInstance.get(API_ENDPOINTS.FINANCES.SIGNING_GET(token))
    return res.data.data
  },

  async submitSignature(token: string, signatureBase64: string, geolocation?: string): Promise<any> {
    const res = await axiosInstance.post(API_ENDPOINTS.FINANCES.SIGNING_SUBMIT(token), {
      signatureBase64,
      geolocation,
    })
    return res.data
  },
}
