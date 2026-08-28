import { Link } from 'react-router-dom'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'
import {
  MODALITY_LABELS,
  getCurrentWeekDay,
  getDayPlan,
  getWeekDayLabel,
  getWeeklyPlanOrDefault,
  summarizePlannedExercise,
} from '../utils/trainingPlan'
import './TodayWorkoutPage.css'

function TodayWorkoutPage() {
  const { currentUser } = useAuth()
  const { getAthleteById } = useAthletes()
  const athlete = currentUser ? getAthleteById(currentUser.athleteId) : undefined

  if (!athlete) {
    return (
      <div className="TodayWorkoutPage">
        <p>Não encontramos seu perfil de atleta.</p>
      </div>
    )
  }

  const today = getCurrentWeekDay()
  const todayLabel = getWeekDayLabel(today)
  const exercises = getDayPlan(getWeeklyPlanOrDefault(athlete), today).exercises

  return (
    <div className="TodayWorkoutPage">
      <h2>Treino do dia — {todayLabel}</h2>

      {exercises.length === 0 ? (
        <div className="TodayWorkoutPage-empty">
          <p>Nenhum exercício configurado para {todayLabel}.</p>
          <Link to={`/athletes/${athlete.id}/plan`}>Configurar plano semanal</Link>
        </div>
      ) : (
        <>
          <ul className="TodayWorkoutPage-list">
            {exercises.map((exercise) => (
              <li key={exercise.id} className="TodayWorkoutPage-item">
                <span className="TodayWorkoutPage-itemName">{exercise.name}</span>
                <span className="TodayWorkoutPage-itemModality">{MODALITY_LABELS[exercise.modality]}</span>
                <span className="TodayWorkoutPage-itemSummary">{summarizePlannedExercise(exercise)}</span>
              </li>
            ))}
          </ul>
          <Link className="TodayWorkoutPage-startLink" to={`/athletes/${athlete.id}/session`}>
            Iniciar sessão de treino
          </Link>
        </>
      )}
    </div>
  )
}

export default TodayWorkoutPage
