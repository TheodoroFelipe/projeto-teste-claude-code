import { Link, Navigate, useNavigate } from 'react-router-dom'
import AthleteForm from '../components/AthleteForm'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'
import type { NewAthleteInput } from '../types/athlete'
import './AthleteFormPage.css'

function NewAthletePage() {
  const { currentUser } = useAuth()
  const { addAthlete } = useAthletes()
  const navigate = useNavigate()

  if (currentUser && currentUser.role !== 'coach') {
    return <Navigate to="/" replace />
  }

  function handleSubmit(input: NewAthleteInput) {
    addAthlete(input)
    navigate('/', { replace: true })
  }

  return (
    <div className="AthleteFormPage">
      <Link className="AthleteFormPage-backLink" to="/">
        &larr; Voltar para a lista
      </Link>
      <h2>Cadastrar atleta</h2>
      <AthleteForm submitLabel="Cadastrar" onSubmit={handleSubmit} />
    </div>
  )
}

export default NewAthletePage
