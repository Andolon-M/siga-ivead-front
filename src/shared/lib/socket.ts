import { io, type Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export function resolveSocketBaseUrl(): string {
  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "")
  if (!apiBaseUrl) return window.location.origin
  return apiBaseUrl.replace(/\/api\/?$/, "")
}

export function getSharedSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(resolveSocketBaseUrl(), { withCredentials: true, autoConnect: true })
  }
  return socketInstance
}

