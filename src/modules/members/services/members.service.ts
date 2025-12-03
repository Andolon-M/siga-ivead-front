import type { Member, CreateMemberData, UpdateMemberData } from "../types"

// Mock service - En producción, estos serían llamadas a la API
export const membersService = {
  async getAllMembers(): Promise<Member[]> {
    // TODO: Implementar llamada a API
    return []
  },

  async getMemberById(id: number): Promise<Member | null> {
    // TODO: Implementar llamada a API
    return null
  },

  async createMember(data: CreateMemberData): Promise<Member> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async updateMember(id: number, data: UpdateMemberData): Promise<Member> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async deleteMember(id: number): Promise<void> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },
}

