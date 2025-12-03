export interface Role {
  id: number
  name: string
  userCount: number
  permissionCount: number
  created_at: string
}

export interface Permission {
  id: number
  resource: string
  action: string
  type: number
  description: string
}

export interface CreateRoleData {
  name: string
  permissions?: number[]
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}

