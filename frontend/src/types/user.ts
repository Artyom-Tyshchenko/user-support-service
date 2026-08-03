export type Role = 'admin' | 'user'

export interface User {
  id: string
  fullName: string
  birthDate: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

export interface AuthResult {
  user: User
  token: string
}

export interface UsersListResult {
  users: User[]
  total: number
  page: number
  limit: number
}
