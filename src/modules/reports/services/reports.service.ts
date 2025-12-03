import type { WeeklyReport, Deposit, Egress, CreateDepositData, CreateEgressData } from "../types"

export const reportsService = {
  async getWeeklyReports(): Promise<WeeklyReport[]> {
    // TODO: Implementar llamada a API
    return []
  },

  async getDeposits(): Promise<Deposit[]> {
    // TODO: Implementar llamada a API
    return []
  },

  async getEgresses(): Promise<Egress[]> {
    // TODO: Implementar llamada a API
    return []
  },

  async createDeposit(data: CreateDepositData): Promise<Deposit> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async createEgress(data: CreateEgressData): Promise<Egress> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async deleteDeposit(id: number): Promise<void> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async deleteEgress(id: number): Promise<void> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },
}

