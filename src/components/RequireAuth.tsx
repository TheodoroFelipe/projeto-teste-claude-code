'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface RequireAuthProps {
  children: ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace('/login')
  }, [isHydrated, isAuthenticated, router])

  if (!isHydrated || !isAuthenticated) return null

  return <>{children}</>
}

export default RequireAuth
