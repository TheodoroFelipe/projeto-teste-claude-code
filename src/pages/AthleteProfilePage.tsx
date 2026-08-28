import { Link, useParams } from 'react-router-dom'
import AthleteCard from '../components/AthleteCard'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import { getLevelProgress, getTotalXp } from '../utils/xp'
import './AthleteProfilePage.css'

function AthleteProfilePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, addEvolutionEntry } = useAthletes()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)

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

      {canManage && (
        <>
          <Link className="AthleteProfilePage-editLink" to={`/athletes/${athlete.id}/edit`}>
            Editar atleta
          </Link>

          <Link className="AthleteProfilePage-planLink" to={`/athletes/${athlete.id}/plan`}>
            Configurar plano semanal
          </Link>

          <Link className="AthleteProfilePage-sessionLink" to={`/athletes/${athlete.id}/session`}>
            Iniciar sessão de treino
          </Link>

          <Link className="AthleteProfilePage-evolutionLink" to={`/athletes/${athlete.id}/evolution`}>
            Ver evolução física
          </Link>
        </>
      )}

      <div className="AthleteProfilePage-progress">
        <p>
          Nível {level} — {currentLevelXp} XP ({xpToNextLevel} XP para o próximo nível)
        </p>
        {canManage && (
          <button
            type="button"
            onClick={() => addEvolutionEntry(athlete.id, { xpGained: 10, note: 'Treino registrado' })}
          >
            +10 XP
          </button>
        )}
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
