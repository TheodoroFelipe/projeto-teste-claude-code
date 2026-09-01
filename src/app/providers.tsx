'use client'

import type { ReactNode } from 'react'
import AuthProvider from '../context/AuthContext'
import AthleteProvider from '../context/AthleteContext'
import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'
import type { Athlete } from '../types/athlete'
import type { PublicUser } from '../types/user'
import type { PlanInvite } from '../types/coachPlan'

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
  initialPendingInvites: PlanInvite[]
}

export function Providers({ children, initialUser, initialAthletes, initialPendingInvites }: ProvidersProps) {
  return (
    <AuthProvider initialUser={initialUser} initialPendingInvites={initialPendingInvites}>
      <AthleteProvider initialAthletes={initialAthletes}>
        <AppShell>{children}</AppShell>
      </AthleteProvider>
    </AuthProvider>
  )
}
