import { Link, useNavigate, useParams } from 'react-router-dom'
import AthleteForm from '../components/AthleteForm'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import type { Athlete, NewAthleteInput } from '../types/athlete'
import './AthleteFormPage.css'

function EditAthletePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, updateAthlete } = useAthletes()
  const navigate = useNavigate()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)

  if (!athlete) {
    return (
      <div className="AthleteFormPage">
        <p>Atleta não encontrado.</p>
        <Link to="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="AthleteFormPage">
        <p>Você não tem permissão para gerenciar este atleta.</p>
        <Link to={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete: Athlete = athlete

  function handleSubmit(input: NewAthleteInput) {
    updateAthlete(currentAthlete.id, input)
    navigate(`/athletes/${currentAthlete.id}`, { replace: true })
  }

  return (
    <div className="AthleteFormPage">
      <Link className="AthleteFormPage-backLink" to={`/athletes/${athlete.id}`}>
        &larr; Voltar para o perfil
      </Link>
      <h2>Editar atleta</h2>
      <AthleteForm initialValues={athlete} submitLabel="Salvar alterações" onSubmit={handleSubmit} />
    </div>
  )
}

export default EditAthletePage
