export type UserRole = 'athlete' | 'coach'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  athleteId: string
  role: UserRole
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'athleteId' | 'role'>

export interface NewUserInput {
  name: string
  email: string
  password: string
  confirmPassword: string
  athleteId: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}
