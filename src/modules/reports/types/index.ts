export interface WeeklyReport {
  id: number
  week: string
  date: string
  deposits: number
  egress: number
}

export interface Deposit {
  id: number
  donor: string
  dni: string
  type: "Diezmo" | "Ofrenda" | "Donación"
  amount: number
  date: string
  week: string
}

export interface Egress {
  id: number
  description: string
  category: string
  amount: number
  date: string
  week: string
  receipt?: string
}

export interface CreateDepositData {
  donor: string
  dni: string
  type: "Diezmo" | "Ofrenda" | "Donación"
  amount: number
  date: string
  week: string
}

export interface CreateEgressData {
  description: string
  category: string
  amount: number
  date: string
  week: string
  receipt?: File
}

