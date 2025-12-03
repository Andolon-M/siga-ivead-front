export interface WorkTeam {
  id: number
  name: string
  leader: string
  memberCount: number
  created_at: string
}

export interface TeamMember {
  id: number
  name: string
  email: string
  joined_at: string
}

export interface CreateTeamData {
  name: string
  leader: string
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

