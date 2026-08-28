import { Link, useParams } from 'react-router-dom'
import DayPlanEditor from '../components/DayPlanEditor'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import { WEEK_DAYS, getDayPlan, getWeeklyPlanOrDefault } from '../utils/trainingPlan'
import type { PlannedExercise } from '../types/trainingPlan'
import './TrainingPlanPage.css'

function TrainingPlanPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, updateWeeklyPlan } = useAthletes()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)

  if (!athlete) {
    return (
      <div className="TrainingPlanPage">
        <p>Atleta não encontrado.</p>
        <Link to="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="TrainingPlanPage">
        <p>Você não tem permissão para gerenciar este atleta.</p>
        <Link to={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete = athlete
  const weeklyPlan = getWeeklyPlanOrDefault(currentAthlete)

  function handleAdd(dayIndex: number, exercise: PlannedExercise) {
    const nextPlan = weeklyPlan.map((dayPlan, index) =>
      index === dayIndex ? { ...dayPlan, exercises: [...dayPlan.exercises, exercise] } : dayPlan,
    )
    updateWeeklyPlan(currentAthlete.id, nextPlan)
  }

  function handleRemove(dayIndex: number, exerciseId: string) {
    const nextPlan = weeklyPlan.map((dayPlan, index) =>
      index === dayIndex
        ? { ...dayPlan, exercises: dayPlan.exercises.filter((exercise) => exercise.id !== exerciseId) }
        : dayPlan,
    )
    updateWeeklyPlan(currentAthlete.id, nextPlan)
  }

  return (
    <div className="TrainingPlanPage">
      <Link className="TrainingPlanPage-backLink" to={`/athletes/${athlete.id}`}>
        &larr; Voltar para o perfil
      </Link>
      <h2>Plano semanal — {athlete.name}</h2>

      <div className="TrainingPlanPage-days">
        {WEEK_DAYS.map(({ day, label }, index) => {
          const dayPlan = getDayPlan(weeklyPlan, day)
          return (
            <DayPlanEditor
              key={day}
              dayLabel={label}
              exercises={dayPlan.exercises}
              onAdd={(exercise) => handleAdd(index, exercise)}
              onRemove={(exerciseId) => handleRemove(index, exerciseId)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default TrainingPlanPage
