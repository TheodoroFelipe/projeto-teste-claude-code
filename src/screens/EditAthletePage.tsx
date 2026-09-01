'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import AthleteForm from '../components/AthleteForm'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import type { Athlete, NewAthleteInput } from '../types/athlete'

function EditAthletePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, updateAthlete } = useAthletes()
  const router = useRouter()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)

  if (!athlete) {
    return (
      <div className="Page">
        <p className="Page-empty">Atleta não encontrado.</p>
        <Link href="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="Page">
        <p className="Page-empty">Você não tem permissão para gerenciar este atleta.</p>
        <Link href={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete: Athlete = athlete

  function handleSubmit(input: NewAthleteInput) {
    updateAthlete(currentAthlete.id, input)
    router.replace(`/athletes/${currentAthlete.id}`)
  }

  return (
    <div className="Page">
      <Link className="Page-backLink" href={`/athletes/${athlete.id}`}>
        &larr; Voltar para o perfil
      </Link>
      <h1 className="Page-title">Editar atleta</h1>
      <AthleteForm initialValues={athlete} submitLabel="Salvar alterações" onSubmit={handleSubmit} />
    </div>
  )
}

export default EditAthletePage
