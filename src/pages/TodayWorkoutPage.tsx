import { Link } from 'react-router-dom'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'
import { calcPlannedExerciseXp } from '../utils/plannedExerciseXp'
import {
  MODALITY_LABELS,
  getCurrentWeekDay,
  getDayPlan,
  getWeekDayLabel,
  getWeeklyPlanOrDefault,
  summarizePlannedExercise,
} from '../utils/trainingPlan'
import { getStreakDays } from '../utils/xp'
import './TodayWorkoutPage.css'

function dominantModalityLabel(modalities: string[]): string {
  const counts = new Map<string, number>()
  for (const modality of modalities) {
    counts.set(modality, (counts.get(modality) ?? 0) + 1)
  }
  const [topModality] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  return MODALITY_LABELS[topModality as keyof typeof MODALITY_LABELS]
}

function TodayWorkoutPage() {
  const { currentUser } = useAuth()
  const { getAthleteById } = useAthletes()
  const athlete = currentUser ? getAthleteById(currentUser.athleteId) : undefined

  if (!athlete) {
    return (
      <div className="Page">
        <p className="Page-empty">Não encontramos seu perfil de atleta.</p>
      </div>
    )
  }

  const today = getCurrentWeekDay()
  const todayLabel = getWeekDayLabel(today)
  const todayDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  const exercises = getDayPlan(getWeeklyPlanOrDefault(athlete), today).exercises
  const streak = getStreakDays(athlete.evolutionHistory)
  const xpAvailable = exercises.reduce((total, exercise) => total + calcPlannedExerciseXp(exercise), 0)

  return (
    <div className="Page">
      <div className="TodayWorkoutPage-topbar">
        <div>
          <span className="Page-eyebrow">Olá, {currentUser?.name}</span>
          <h1 className="Page-title">Treino do dia</h1>
          <span className="Page-eyebrow TodayWorkoutPage-date">{todayDate}</span>
        </div>
        {streak > 0 && (
          <span className="streak-badge">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none">
              <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A5.5 5.5 0 0 1 11.5 22 6.5 6.5 0 0 1 5 15.5C5 10 9 8 9 4c1 1 2 1.5 3-2z" />
            </svg>
            {streak}
          </span>
        )}
      </div>

      {exercises.length === 0 ? (
        <div className="card TodayWorkoutPage-empty">
          <p>Nenhum exercício configurado para {todayLabel}.</p>
          <Link to={`/athletes/${athlete.id}/plan`}>Configurar plano semanal</Link>
        </div>
      ) : (
        <>
          <div className="card TodayWorkoutPage-hero">
            <span className="chip TodayWorkoutPage-modalityTag">{dominantModalityLabel(exercises.map((e) => e.modality))}</span>
            <div>
              <div className="TodayWorkoutPage-heroTitle">{todayLabel}</div>
              <div className="TodayWorkoutPage-heroMeta">{exercises.length} exercícios</div>
            </div>
            <Link className="btn-primary" to={`/athletes/${athlete.id}/session`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
                <path d="M8 5v14l11-7z" />
              </svg>
              INICIAR TREINO
            </Link>
            {xpAvailable > 0 && (
              <div className="TodayWorkoutPage-xpRow">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
                </svg>
                XP disponível hoje: +{xpAvailable} XP
              </div>
            )}
          </div>

          <div>
            <div className="section-title" style={{ marginBottom: 10 }}>
              Exercícios de hoje
            </div>
            <ul className="TodayWorkoutPage-list">
              {exercises.map((exercise) => (
                <li key={exercise.id} className="TodayWorkoutPage-item">
                  <span className="TodayWorkoutPage-checkbox" aria-hidden="true" />
                  <div className="TodayWorkoutPage-itemInfo">
                    <div className="TodayWorkoutPage-itemName">{exercise.name}</div>
                    <div className="TodayWorkoutPage-itemDetail">
                      {MODALITY_LABELS[exercise.modality]} · {summarizePlannedExercise(exercise)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default TodayWorkoutPage
