import type { User, CreateUserData, UpdateUserData } from "../types"

// Mock service - En producción, estos serían llamadas a la API
export const usersService = {
  async getAllUsers(): Promise<User[]> {
    // TODO: Implementar llamada a API
    return []
  },

  async getUserById(id: number): Promise<User | null> {
    // TODO: Implementar llamada a API
    return null
  },

  async createUser(data: CreateUserData): Promise<User> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },

  async deleteUser(id: number): Promise<void> {
    // TODO: Implementar llamada a API
    throw new Error("Not implemented")
  },
}

