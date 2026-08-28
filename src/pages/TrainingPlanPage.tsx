import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DayPlanEditor from '../components/DayPlanEditor'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import { WEEK_DAYS, getDayPlan, getWeeklyPlanOrDefault } from '../utils/trainingPlan'
import type { PlannedExercise, WeeklyPlan } from '../types/trainingPlan'
import './TrainingPlanPage.css'

function TrainingPlanPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, updateWeeklyPlan } = useAthletes()
  const navigate = useNavigate()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)
  const [draftPlan, setDraftPlan] = useState<WeeklyPlan | null>(null)

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
  const weeklyPlan = draftPlan ?? getWeeklyPlanOrDefault(currentAthlete)

  function handleAdd(dayIndex: number, exercise: PlannedExercise) {
    setDraftPlan(
      weeklyPlan.map((dayPlan, index) =>
        index === dayIndex ? { ...dayPlan, exercises: [...dayPlan.exercises, exercise] } : dayPlan,
      ),
    )
  }

  function handleRemove(dayIndex: number, exerciseId: string) {
    setDraftPlan(
      weeklyPlan.map((dayPlan, index) =>
        index === dayIndex
          ? { ...dayPlan, exercises: dayPlan.exercises.filter((exercise) => exercise.id !== exerciseId) }
          : dayPlan,
      ),
    )
  }

  function handleSave() {
    updateWeeklyPlan(currentAthlete.id, weeklyPlan)
    navigate(`/athletes/${currentAthlete.id}`)
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

      <button type="button" className="TrainingPlanPage-saveButton" onClick={handleSave}>
        Salvar plano
      </button>
    </div>
  )
}

export default TrainingPlanPage
