'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AthleteForm from '../components/AthleteForm'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'
import type { NewAthleteInput } from '../types/athlete'

function NewAthletePage() {
  const { currentUser } = useAuth()
  const { addAthlete } = useAthletes()
  const router = useRouter()
  const shouldRedirectAway = Boolean(currentUser && currentUser.role !== 'coach')

  useEffect(() => {
    if (shouldRedirectAway) router.replace('/')
  }, [shouldRedirectAway, router])

  if (shouldRedirectAway) return null

  function handleSubmit(input: NewAthleteInput) {
    addAthlete(input)
    router.replace('/')
  }

  return (
    <div className="Page">
      <Link className="Page-backLink" href="/">
        &larr; Voltar para a lista
      </Link>
      <h1 className="Page-title">Cadastrar atleta</h1>
      <AthleteForm submitLabel="Cadastrar" onSubmit={handleSubmit} />
    </div>
  )
}

export default NewAthletePage
