'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import AthleteCard from '../components/AthleteCard'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import { getLevelProgress, getTotalXp } from '../utils/xp'

function AthleteProfilePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById } = useAthletes()
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

  const totalXp = getTotalXp(athlete.evolutionHistory)
  const { level, currentLevelXp, xpToNextLevel } = getLevelProgress(totalXp)
  const sortedHistory = [...athlete.evolutionHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="Page">
      <Link className="Page-backLink" href="/">
        &larr; Voltar para a lista
      </Link>

      <AthleteCard athlete={athlete} />

      {canManage && (
        <div className="AthleteProfilePage-actions">
          <Link className="btn-secondary" href={`/athletes/${athlete.id}/edit`}>
            Editar atleta
          </Link>
          <Link className="btn-secondary" href={`/athletes/${athlete.id}/plan`}>
            Configurar plano semanal
          </Link>
          <Link className="btn-secondary" href={`/athletes/${athlete.id}/session`}>
            Iniciar sessão de treino
          </Link>
          <Link className="btn-secondary" href={`/athletes/${athlete.id}/evolution`}>
            Ver evolução física
          </Link>
        </div>
      )}

      <div className="card AthleteProfilePage-progress">
        <div className="level-row">
          <span className="level-tag">NÍVEL ATUAL</span>
          <span className="level-num">Nível {level}</span>
        </div>
        <div className="level-track">
          <div className="level-fill" style={{ width: `${Math.round((currentLevelXp / (currentLevelXp + xpToNextLevel)) * 100)}%` }} />
        </div>
        <div className="level-caption">
          {currentLevelXp} / {currentLevelXp + xpToNextLevel} XP para o próximo nível
        </div>
      </div>

      <div>
        <div className="section-title" style={{ marginBottom: 10 }}>
          Histórico
        </div>
        {sortedHistory.length === 0 ? (
          <p className="Page-empty">Nenhum registro ainda.</p>
        ) : (
          <ul className="AthleteProfilePage-history">
            {sortedHistory.map((entry) => (
              <li key={entry.id} className="AthleteProfilePage-historyEntry">
                {new Date(entry.date).toLocaleDateString('pt-BR')} — +{entry.xpGained} XP
                {entry.note && ` (${entry.note})`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AthleteProfilePage
