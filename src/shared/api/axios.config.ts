import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from "axios"
import { toast } from "sonner"

// Interfaz para la respuesta del backend
interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}

// Obtener o inicializar un identificador persistente del dispositivo
const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem("device_id")
  if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
    localStorage.setItem("device_id", deviceId)
  }
  return deviceId
}

// Crear instancia de Axios con soporte de cookies seguras HttpOnly
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Variables para controlar la cola de refresco concurrente
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor de Request - Agregar token de autenticación y device id
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Identificador persistente de dispositivo
    config.headers["x-device-id"] = getOrCreateDeviceId()

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor de Response - Manejar respuestas, auto-refresco y errores
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Si la petición tiene la propiedad silent/skipToast, no mostrar toast de éxito
    const isSilent = Boolean(
      (response.config as any)?.silent ||
      (response.config as any)?.skipToast ||
      response.config.headers?.["X-Silent"] === "true" ||
      response.config.headers?.["x-silent"] === "true" ||
      response.config.headers?.["X-Skip-Toast"] === "true"
    )

    // Si la respuesta tiene un mensaje de éxito y no es silenciosa, mostrarlo
    if (!isSilent && response.data?.message) {
      const method = response.config.method?.toUpperCase()
      if (method !== "GET") {
        toast.success(response.data.message, {
          duration: 3000,
        })
      }
    }

    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Manejar diferentes tipos de errores si hay respuesta
    if (error.response) {
      const { status, data } = error.response
      const message = data?.message || "Ha ocurrido un error"

      // Manejo de 401 con intento de refresco automático vía cookie HttpOnly
      if (status === 401 && originalRequest && !originalRequest._retry) {
        const isAuthEndpoint = originalRequest.url?.includes("/auth/login") ||
                               originalRequest.url?.includes("/auth/refresh-token") ||
                               originalRequest.url?.includes("/auth/2fa/verify")

        if (!isAuthEndpoint) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return axiosInstance(originalRequest)
              })
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            // Intentar refrescar token usando la cookie HttpOnly
            const refreshResponse = await axios.post<ApiResponse<{ token: string }>>(
              `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
              {},
              {
                withCredentials: true,
                headers: {
                  "x-device-id": getOrCreateDeviceId()
                }
              }
            )

            const newToken = refreshResponse.data.data.token
            localStorage.setItem("token", newToken)
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            processQueue(null, newToken)
            return axiosInstance(originalRequest)
          } catch (refreshErr) {
            processQueue(refreshErr, null)
            localStorage.removeItem("token")
            localStorage.removeItem("user")

            // Redirigir al login solo si expiró definitivamente
            if (window.location.pathname !== "/login") {
              toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", {
                duration: 4000,
              })
              setTimeout(() => {
                window.location.href = "/login"
              }, 1200)
            }

            return Promise.reject(refreshErr)
          } finally {
            isRefreshing = false
          }
        }
      }

      switch (status) {
        case 400:
          toast.error(message, { duration: 4000 })
          break
        case 401:
          // Solo mostrar toast de 401 si no fue una petición interna de refresh
          if (!originalRequest.url?.includes("/auth/refresh-token")) {
            toast.error(message, { duration: 4000 })
          }
          break
        case 403:
          toast.error(message || "No tienes permisos para realizar esta acción", { duration: 4000 })
          break
        case 404:
          toast.error(message || "Recurso no encontrado", { duration: 3000 })
          break
        case 422:
          toast.error(message || "Error de validación", { duration: 4000 })
          break
        case 500:
          toast.error(message || "Error interno del servidor", { duration: 4000 })
          break
        default:
          toast.error(message, { duration: 4000 })
      }
    } else if (error.request) {
      toast.error("No se pudo conectar con el servidor. Verifica tu conexión a internet.", {
        duration: 5000,
      })
    } else {
      toast.error("Error al procesar la solicitud", { duration: 3000 })
    }

    return Promise.reject(error)
  }
)

export { axiosInstance }
export default axiosInstance
export type { ApiResponse }
