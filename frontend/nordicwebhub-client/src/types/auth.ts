export type AuthRole = 'Admin' | 'Customer'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: AuthRole | string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
}
