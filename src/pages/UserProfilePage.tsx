import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'
import { getLevelProgress, getStreakDays, getTotalXp } from '../utils/xp'
import './UserProfilePage.css'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function UserProfilePage() {
  const { currentUser, updateName, logout } = useAuth()
  const { getAthleteById } = useAthletes()
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!currentUser) return null

  const athlete = getAthleteById(currentUser.athleteId)
  const evolutionHistory = athlete?.evolutionHistory ?? []
  const totalXp = getTotalXp(evolutionHistory)
  const { level, currentLevelXp, xpToNextLevel } = getLevelProgress(totalXp)
  const progressPercent = Math.round((currentLevelXp / (currentLevelXp + xpToNextLevel)) * 100)
  const streak = getStreakDays(evolutionHistory)
  const sortedHistory = [...evolutionHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  function startEditing() {
    setNameDraft(currentUser!.name)
    setError(null)
    setIsEditingName(true)
  }

  async function handleSave() {
    const result = await updateName(nameDraft)
    if (result.ok) {
      setIsEditingName(false)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="Page">
      <div className="UserProfilePage-hero">
        <span className="avatar UserProfilePage-avatarLg">{initials(currentUser.name)}</span>

        {isEditingName ? (
          <div className="UserProfilePage-nameEdit">
            <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
            <button type="button" className="btn-secondary" onClick={handleSave}>
              Salvar
            </button>
            <button type="button" className="btn-ghost" onClick={() => setIsEditingName(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className="UserProfilePage-nameButton" onClick={startEditing}>
            <span className="UserProfilePage-heroName">{currentUser.name}</span>
          </button>
        )}
        {error && <p className="field-error">{error}</p>}

        <span className="UserProfilePage-heroSub">
          {athlete?.sport ?? currentUser.email}
          {currentUser.role === 'coach' && ' · Treinador'}
        </span>
        <div className="UserProfilePage-heroChips">
          <span className="chip">{currentUser.email}</span>
        </div>
      </div>

      <div className="card">
        <div className="level-row">
          <span className="level-tag">NÍVEL ATUAL</span>
          <span className="level-num">Nível {level}</span>
        </div>
        <div className="level-track">
          <div className="level-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="level-caption">
          {currentLevelXp} / {currentLevelXp + xpToNextLevel} XP para o próximo nível
        </div>
      </div>

      <div className="stat-grid UserProfilePage-statGrid">
        <div className="stat-tile UserProfilePage-statTile">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--coral)" stroke="none">
            <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A5.5 5.5 0 0 1 11.5 22 6.5 6.5 0 0 1 5 15.5C5 10 9 8 9 4c1 1 2 1.5 3-2z" />
          </svg>
          <span className="stat-tile-value">{streak} dias</span>
          <span className="stat-tile-label">Sequência</span>
        </div>
        <div className="stat-tile UserProfilePage-statTile">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3 4 14h6l-1 7 9-11h-6z" />
          </svg>
          <span className="stat-tile-value">{evolutionHistory.length}</span>
          <span className="stat-tile-label">Treinos</span>
        </div>
        <div className="stat-tile UserProfilePage-statTile">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" />
          </svg>
          <span className="stat-tile-value">{totalXp}</span>
          <span className="stat-tile-label">XP total</span>
        </div>
      </div>

      <div>
        <div className="section-title">Histórico de evolução</div>
        <div className="card UserProfilePage-timeline">
          {sortedHistory.length === 0 ? (
            <p className="Page-empty">Nenhum registro de XP ainda.</p>
          ) : (
            sortedHistory.map((entry) => (
              <div className="UserProfilePage-timelineRow" key={entry.id}>
                <span className="UserProfilePage-timelineDate">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                </span>
                <span className="UserProfilePage-timelineNote">{entry.note ?? 'Treino registrado'}</span>
                <span className="badge-lime">+{entry.xpGained} XP</span>
              </div>
            ))
          )}
        </div>
      </div>

      {athlete && (
        <Link className="btn-secondary" to={`/athletes/${athlete.id}`} style={{ textAlign: 'center' }}>
          Meu perfil de atleta
        </Link>
      )}

      <button type="button" className="btn-ghost" onClick={logout}>
        Sair
      </button>
    </div>
  )
}

export default UserProfilePage
