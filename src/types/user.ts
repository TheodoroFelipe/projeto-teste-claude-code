export type UserRole = 'athlete' | 'coach'
export type UserPlan = 'free' | 'pro'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  athleteId: string
  role: UserRole
  plan: UserPlan
  /** ISO date em que o Pro expira; null = sem expiração definida. */
  proUntil: string | null
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'athleteId' | 'role' | 'plan' | 'proUntil'>

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
