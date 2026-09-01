'use client'

import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import { isEmailTakenAction, loginAction, logoutAction, registerAction, updateNameAction } from '../app/actions/auth'
import type { LoginInput, NewUserInput, PublicUser } from '../types/user'

export type AuthResult = { ok: true } | { ok: false; error: string }

export interface AuthContextValue {
  currentUser: PublicUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  register: (input: NewUserInput) => Promise<AuthResult>
  login: (input: LoginInput) => Promise<AuthResult>
  logout: () => void
  updateName: (name: string) => Promise<AuthResult>
  isEmailTaken: (email: string) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  initialUser: PublicUser | null
}

function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(initialUser)
  const isAuthenticated = currentUser !== null

  async function register(input: NewUserInput): Promise<AuthResult> {
    const result = await registerAction(input)
    if (result.ok) setCurrentUser(result.user)
    return result
  }

  async function login(input: LoginInput): Promise<AuthResult> {
    const result = await loginAction(input)
    if (result.ok) setCurrentUser(result.user)
    return result
  }

  function logout(): void {
    setCurrentUser(null)
    void logoutAction()
  }

  async function updateName(name: string): Promise<AuthResult> {
    const result = await updateNameAction(name)
    if (result.ok) setCurrentUser(result.user)
    return result
  }

  function isEmailTaken(email: string): Promise<boolean> {
    return isEmailTakenAction(email)
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated, isHydrated: true, register, login, logout, updateName, isEmailTaken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
