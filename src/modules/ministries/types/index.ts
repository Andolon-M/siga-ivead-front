export interface Ministry {
  id: number
  name: string
  description: string
  members: number
  leader: string
  created: string
}

export interface CreateMinistryData {
  name: string
  description: string
  leader?: string
}

export interface UpdateMinistryData extends Partial<CreateMinistryData> {
  members?: number
}

