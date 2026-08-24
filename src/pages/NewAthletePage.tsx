import { Link, useNavigate } from 'react-router-dom'
import AthleteForm from '../components/AthleteForm'
import { useAthletes } from '../hooks/useAthletes'
import type { NewAthleteInput } from '../types/athlete'
import './AthleteFormPage.css'

function NewAthletePage() {
  const { addAthlete } = useAthletes()
  const navigate = useNavigate()

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
