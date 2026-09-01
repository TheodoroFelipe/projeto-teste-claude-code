'use client'

import type { ReactNode } from 'react'
import AuthProvider from '../context/AuthContext'
import AthleteProvider from '../context/AthleteContext'
import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import type { Athlete } from '../types/athlete'
import type { PublicUser } from '../types/user'

function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="App">
      {isAuthenticated && <NavBar />}
      <main className="App-main">{children}</main>
    </div>
  )
}

interface ProvidersProps {
  children: ReactNode
  initialUser: PublicUser | null
  initialAthletes: Athlete[]
}

export function Providers({ children, initialUser, initialAthletes }: ProvidersProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      <AthleteProvider initialAthletes={initialAthletes}>
        <AppShell>{children}</AppShell>
      </AthleteProvider>
    </AuthProvider>
  )
}
