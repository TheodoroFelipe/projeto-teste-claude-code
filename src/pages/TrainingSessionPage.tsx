import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ExerciseLogger from '../components/ExerciseLogger'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import {
  WEEK_DAYS,
  formatDuration,
  getCurrentWeekDay,
  getDayPlan,
  getWeekDayLabel,
  getWeeklyPlanOrDefault,
} from '../utils/trainingPlan'
import type { WeekDay } from '../types/trainingPlan'
import './TrainingSessionPage.css'

function TrainingSessionPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, addEvolutionEntry } = useAthletes()
  const navigate = useNavigate()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)

  const [selectedDay, setSelectedDay] = useState<WeekDay>(getCurrentWeekDay())
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [bankedXp, setBankedXp] = useState(0)
  const [liveXp, setLiveXp] = useState(0)
  const [bursting, setBursting] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  if (!athlete) {
    return (
      <div className="TrainingSessionPage">
        <p>Atleta não encontrado.</p>
        <Link to="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="TrainingSessionPage">
        <p>Você não tem permissão para gerenciar este atleta.</p>
        <Link to={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete = athlete
  const weeklyPlan = getWeeklyPlanOrDefault(currentAthlete)
  const exercises = getDayPlan(weeklyPlan, selectedDay).exercises
  const currentExercise = exercises[exerciseIndex]
  const sessionXp = bankedXp + liveXp

  function handleDayChange(day: WeekDay) {
    setSelectedDay(day)
    setExerciseIndex(0)
    setBankedXp(0)
    setLiveXp(0)
  }

  function handleUnitCompleted() {
    setBursting(true)
    window.setTimeout(() => setBursting(false), 620)
  }

  function handleClose() {
    navigate(`/athletes/${currentAthlete.id}`)
  }

  function handleAdvance() {
    const totalXp = bankedXp + liveXp
    const isLast = exerciseIndex === exercises.length - 1

    if (isLast) {
      if (totalXp > 0) {
        addEvolutionEntry(currentAthlete.id, {
          xpGained: totalXp,
          note: `${getWeekDayLabel(selectedDay)} — ${exercises.map((exercise) => exercise.name).join(', ')}`,
        })
      }
      navigate(`/athletes/${currentAthlete.id}`)
    } else {
      setBankedXp(totalXp)
      setLiveXp(0)
      setExerciseIndex((prev) => prev + 1)
    }
  }

  return (
    <div className="TrainingSessionPage">
      <div className="TrainingSessionPage-card">
        <div className="TrainingSessionPage-topBar">
          <button
            type="button"
            className="TrainingSessionPage-closeButton"
            onClick={handleClose}
            aria-label="Fechar sessão"
          >
            ✕
          </button>
          <div className="TrainingSessionPage-topBarInfo">
            <select
              className="TrainingSessionPage-daySelect"
              value={selectedDay}
              onChange={(event) => handleDayChange(event.target.value as WeekDay)}
            >
              {WEEK_DAYS.map(({ day, label }) => (
                <option key={day} value={day}>
                  {label}
                </option>
              ))}
            </select>
            <div className="TrainingSessionPage-meta">
              {exercises.length > 0
                ? `Exercício ${exerciseIndex + 1} de ${exercises.length} · ${formatDuration(elapsedSeconds)} decorrido`
                : `${formatDuration(elapsedSeconds)} decorrido`}
            </div>
          </div>
          <div className="TrainingSessionPage-xpBadgeWrap">
            <div className="TrainingSessionPage-xpBadge">+{sessionXp}</div>
            {bursting && <div className="TrainingSessionPage-burst" />}
          </div>
        </div>

        <div className="TrainingSessionPage-body">
          {currentExercise ? (
            <ExerciseLogger
              key={currentExercise.id}
              exercise={currentExercise}
              onXpChange={setLiveXp}
              onUnitCompleted={handleUnitCompleted}
            />
          ) : (
            <div className="TrainingSessionPage-empty">
              <p>Nenhum exercício configurado para {getWeekDayLabel(selectedDay)}.</p>
              <Link to={`/athletes/${currentAthlete.id}/plan`}>Configurar plano semanal</Link>
            </div>
          )}
        </div>

        {currentExercise && (
          <div className="TrainingSessionPage-footer">
            <button type="button" className="TrainingSessionPage-nextButton" onClick={handleAdvance}>
              {exerciseIndex === exercises.length - 1 ? 'Finalizar sessão' : 'Próximo exercício'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainingSessionPage
