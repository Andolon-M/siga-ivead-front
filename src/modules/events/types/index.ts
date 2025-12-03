export type EventStatus = "PLANIFICADO" | "ACTIVO" | "FINALIZADO" | "CANCELADO"

export type AttendeeStatus = "REGISTRADO" | "CONFIRMADO" | "ASISTIO" | "AUSENTE" | "CANCELADO"

export type PaymentStatus = "PENDIENTE" | "PARCIAL" | "COMPLETO" | "EXONERADO"

export type PaymentType = "COMPLETO" | "PARCIAL"

export interface Member {
  id: number
  name: string
  dni: string
  cell: string
}

export interface Event {
  id: number
  title: string
  description: string
  location: string
  date: string
  time: string
  status: EventStatus
  capacity: number
  registered: number
  hasPrice: boolean
  price?: number
  ministry: string
  responsible?: string
  imageUrl?: string
}

export interface EventSession {
  id: number
  title: string
  startDate: string
  endDate: string
  location: string
  capacity: number
  registered: number
}

export interface SessionAttendance {
  sessionId: number
  status: "ASISTIO" | "AUSENTE"
  checkInTime?: string
}

export interface Attendee {
  id: number
  member: Member
  status: AttendeeStatus
  paidStatus: PaymentStatus
  amountPaid: number
  qrCode: string | null
  confirmedAt: string | null
  sessionAttendance: SessionAttendance[]
  receiptUrl?: string
}

export interface CreateEventData {
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  ministry: string
  hasPrice: boolean
  price?: number
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: EventStatus
  responsible?: string
}

export interface CreateSessionData {
  title: string
  startDate: string
  endDate: string
  location: string
  capacity: number
}

export interface UpdateSessionData extends Partial<CreateSessionData> {}

export interface RegisterAttendeeData {
  memberId: number
  paidStatus?: PaymentStatus
  amountPaid?: number
  receiptFile?: File
  notes?: string
}

export interface PaymentData {
  attendeeId: number
  type: PaymentType
  amount: number
  receiptFile?: File
  notes?: string
}

