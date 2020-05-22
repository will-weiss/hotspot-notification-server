type StandardPostgresModel = {
  id: number
  updated_at: Date
  created_at: Date
}

type HealthyAuthorityInfoModel = StandardPostgresModel & {
  key: string
  value: string
}

type RoleModel = StandardPostgresModel & {
  role: string
}

