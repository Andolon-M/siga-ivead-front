import type { Ministry, CreateMinistryData, UpdateMinistryData } from "../types"

// Mock service - En producción, estos serían llamadas a la API
export const ministriesService = {
  async getAllMinistries(): Promise<Ministry[]> {
    // TODO: Implementar llamada a API
    return []
  },

  async getMinistryById(id: number): Promise<Ministry | null> {
    // TODO: Implementar llamada a API
    return null
  },

  async createMinistry(data: CreateMinistryData): Promise<Ministry> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async updateMinistry(id: number, data: UpdateMinistryData): Promise<Ministry> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async deleteMinistry(id: number): Promise<void> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },
}

