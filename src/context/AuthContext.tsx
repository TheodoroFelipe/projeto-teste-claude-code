'use client'

import { createContext } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/id'
import { hashPassword } from '../utils/passwordHash'
import { isValidEmail, MIN_PASSWORD_LENGTH } from '../utils/validation'
import type { LoginInput, NewUserInput, PublicUser, User } from '../types/user'

export type AuthResult = { ok: true } | { ok: false; error: string }

export interface AuthContextValue {
  currentUser: PublicUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  register: (input: NewUserInput) => Promise<AuthResult>
  login: (input: LoginInput) => Promise<AuthResult>
  logout: () => void
  updateName: (name: string) => Promise<AuthResult>
  isEmailTaken: (email: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    athleteId: user.athleteId,
    role: user.role,
  }
}

function AuthProvider({ children }: AuthProviderProps) {
  const [users, setUsers, usersHydrated] = useLocalStorage<User[]>('projeto-teste:users', [])
  const [currentUserId, setCurrentUserId, currentUserIdHydrated] = useLocalStorage<string | null>(
    'projeto-teste:currentUserId',
    null,
  )
  const isHydrated = usersHydrated && currentUserIdHydrated

  const currentUserRecord = currentUserId ? users.find((user) => user.id === currentUserId) : undefined
  const currentUser = currentUserRecord ? toPublicUser(currentUserRecord) : null
  const isAuthenticated = currentUser !== null

  // Mock de prototipagem: register/login leem `users` do closure do render,
  // então submits concorrentes poderiam teoricamente correr. Aceitável neste escopo.
  async function register(input: NewUserInput): Promise<AuthResult> {
    const name = input.name.trim()
    const email = input.email.trim().toLowerCase()

    if (!name) return { ok: false, error: 'Nome é obrigatório.' }
    if (!isValidEmail(email)) return { ok: false, error: 'E-mail inválido.' }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` }
    }
    if (input.password !== input.confirmPassword) {
      return { ok: false, error: 'As senhas não coincidem.' }
    }
    if (users.some((user) => user.email.toLowerCase() === email)) {
      return { ok: false, error: 'Este e-mail já está cadastrado.' }
    }

    const newUser: User = {
      id: generateId(),
      name,
      email,
      passwordHash: await hashPassword(input.password),
      createdAt: new Date().toISOString(),
      athleteId: input.athleteId,
      role: input.role,
    }
    setUsers((prev) => [...prev, newUser])
    setCurrentUserId(newUser.id)
    return { ok: true }
  }

  function isEmailTaken(email: string): boolean {
    return users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())
  }

  async function login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase()
    const user = users.find((candidate) => candidate.email.toLowerCase() === email)
    const invalidCredentialsError: AuthResult = { ok: false, error: 'E-mail ou senha inválidos.' }

    if (!user) return invalidCredentialsError

    const passwordHash = await hashPassword(input.password)
    if (passwordHash !== user.passwordHash) return invalidCredentialsError

    setCurrentUserId(user.id)
    return { ok: true }
  }

  function logout(): void {
    setCurrentUserId(null)
  }

  async function updateName(name: string): Promise<AuthResult> {
    const trimmedName = name.trim()
    if (!currentUser) return { ok: false, error: 'Nenhum usuário autenticado.' }
    if (!trimmedName) return { ok: false, error: 'Nome é obrigatório.' }

    setUsers((prev) => prev.map((user) => (user.id === currentUser.id ? { ...user, name: trimmedName } : user)))
    return { ok: true }
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated, isHydrated, register, login, logout, updateName, isEmailTaken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
