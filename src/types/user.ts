export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt'>

export interface NewUserInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginInput {
  email: string
  password: string
}
