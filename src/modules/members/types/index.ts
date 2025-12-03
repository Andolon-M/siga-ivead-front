export type MemberStatus = "ACTIVO" | "ASISTENTE" | "INACTIVO"

export type Gender = "MASCULINO" | "FEMENINO"

export type DocumentType = "CC" | "TI" | "CE" | "PP"

export interface Member {
  id: number
  name: string
  dni: string
  phone: string
  status: MemberStatus
  gender: Gender
  birthdate: string
  documentType?: DocumentType
  address?: string
  lastName?: string
}

export interface CreateMemberData {
  name: string
  lastName?: string
  documentType: DocumentType
  dni: string
  birthdate: string
  gender: Gender
  phone: string
  status: MemberStatus
  address?: string
}

export interface UpdateMemberData extends Partial<CreateMemberData> {}

