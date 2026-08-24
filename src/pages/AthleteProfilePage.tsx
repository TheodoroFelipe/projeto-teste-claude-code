import { Link, useParams } from 'react-router-dom'
import AthleteCard from '../components/AthleteCard'
import { useAthletes } from '../hooks/useAthletes'
import { getLevelProgress, getTotalXp } from '../utils/xp'
import './AthleteProfilePage.css'

function AthleteProfilePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, addEvolutionEntry } = useAthletes()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined

  if (!athlete) {
    return (
      <div className="AthleteProfilePage">
        <p>Atleta não encontrado.</p>
        <Link to="/">Voltar para a lista</Link>
      </div>
    )
  }

  const totalXp = getTotalXp(athlete.evolutionHistory)
  const { level, currentLevelXp, xpToNextLevel } = getLevelProgress(totalXp)
  const sortedHistory = [...athlete.evolutionHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="AthleteProfilePage">
      <Link className="AthleteProfilePage-backLink" to="/">
        &larr; Voltar para a lista
      </Link>

      <AthleteCard athlete={athlete} />

      <Link className="AthleteProfilePage-editLink" to={`/athletes/${athlete.id}/edit`}>
        Editar atleta
      </Link>

      <div className="AthleteProfilePage-progress">
        <p>
          Nível {level} — {currentLevelXp} XP ({xpToNextLevel} XP para o próximo nível)
        </p>
        <button type="button" onClick={() => addEvolutionEntry(athlete.id, { xpGained: 10, note: 'Treino registrado' })}>
          +10 XP
        </button>
      </div>

      <ul className="AthleteProfilePage-history">
        {sortedHistory.map((entry) => (
          <li key={entry.id} className="AthleteProfilePage-historyEntry">
            {new Date(entry.date).toLocaleDateString('pt-BR')} — +{entry.xpGained} XP
            {entry.note && ` (${entry.note})`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AthleteProfilePage
