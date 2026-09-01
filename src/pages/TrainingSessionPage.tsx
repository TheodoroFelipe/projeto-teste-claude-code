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
      <div className="Page">
        <p className="Page-empty">Atleta não encontrado.</p>
        <Link to="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="Page">
        <p className="Page-empty">Você não tem permissão para gerenciar este atleta.</p>
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

  function finishOrAdvance(xpToBank: number) {
    const isLast = exerciseIndex === exercises.length - 1
    if (isLast) {
      if (xpToBank > 0) {
        addEvolutionEntry(currentAthlete.id, {
          xpGained: xpToBank,
          note: `${getWeekDayLabel(selectedDay)} — ${exercises.map((exercise) => exercise.name).join(', ')}`,
        })
      }
      navigate(`/athletes/${currentAthlete.id}`)
    } else {
      setBankedXp(xpToBank)
      setLiveXp(0)
      setExerciseIndex((prev) => prev + 1)
    }
  }

  function handleAdvance() {
    finishOrAdvance(bankedXp + liveXp)
  }

  function handleSkip() {
    finishOrAdvance(bankedXp)
  }

  return (
    <div className="Page TrainingSessionPage">
      <div className="TrainingSessionPage-topbar">
        <button type="button" className="TrainingSessionPage-exitLink" onClick={handleClose}>
          Sair
        </button>
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
        <span className="TrainingSessionPage-timer">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          {formatDuration(elapsedSeconds)}
        </span>
      </div>

      {exercises.length > 0 && (
        <div>
          <div className="TrainingSessionPage-progressLabel">
            Exercício {exerciseIndex + 1} de {exercises.length}
          </div>
          <div className="TrainingSessionPage-progressBar">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`TrainingSessionPage-progressSeg${index <= exerciseIndex ? ' done' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="TrainingSessionPage-xpBadgeWrap">
        <div className="TrainingSessionPage-xpBadge">+{sessionXp} XP</div>
        {bursting && <div className="TrainingSessionPage-burst" />}
      </div>

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

      {currentExercise && (
        <div className="TrainingSessionPage-footer">
          <button type="button" className="btn-primary" onClick={handleAdvance}>
            {exerciseIndex === exercises.length - 1 ? 'FINALIZAR SESSÃO' : 'PRÓXIMO EXERCÍCIO'}
          </button>
          {exerciseIndex < exercises.length - 1 && (
            <button type="button" className="btn-ghost" onClick={handleSkip}>
              Pular exercício
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainingSessionPage
