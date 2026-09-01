'use client'

import type { ReactNode } from 'react'
import AuthProvider from '../context/AuthContext'
import AthleteProvider from '../context/AthleteContext'
import NavBar from '../components/NavBar'
import { useAuth } from '../hooks/useAuth'

function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="App">
      {isAuthenticated && <NavBar />}
      <main className="App-main">{children}</main>
    </div>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AthleteProvider>
        <AppShell>{children}</AppShell>
      </AthleteProvider>
    </AuthProvider>
  )
}
