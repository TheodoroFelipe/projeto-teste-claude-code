'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import ExerciseLogger from '../components/ExerciseLogger'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import {
  WEEK_DAYS,
  formatDuration,
  getCurrentWeekDay,
  getDayPlan,
  getEffectiveWeeklyPlan,
  getUnitCount,
  getWeekDayLabel,
} from '../utils/trainingPlan'
import type { PlannedExercise, WeekDay } from '../types/trainingPlan'

function isExerciseComplete(exercise: PlannedExercise, done: boolean[] | undefined): boolean {
  if (!done || done.length === 0) return false
  if (exercise.modality === 'musculacao') return done.every(Boolean)
  return done[0] === true
}

function TrainingSessionPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, addEvolutionEntry } = useAthletes()
  const router = useRouter()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)

  const [selectedDay, setSelectedDay] = useState<WeekDay>(getCurrentWeekDay())
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [xpByIndex, setXpByIndex] = useState<Record<number, number>>({})
  const [doneByIndex, setDoneByIndex] = useState<Record<number, boolean[]>>({})
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [bursting, setBursting] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [warningResetForIndex, setWarningResetForIndex] = useState(exerciseIndex)

  useEffect(() => {
    const interval = window.setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  // Reset the incomplete-exercise warning whenever the current exercise changes.
  // Adjusted during render (not in an effect) per React's guidance for state that
  // depends on a prop/value change, avoiding an extra render pass.
  if (warningResetForIndex !== exerciseIndex) {
    setWarningResetForIndex(exerciseIndex)
    setShowIncompleteWarning(false)
  }

  if (!athlete) {
    return (
      <div className="Page">
        <p className="Page-empty">Atleta não encontrado.</p>
        <Link href="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="Page">
        <p className="Page-empty">Você não tem permissão para gerenciar este atleta.</p>
        <Link href={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete = athlete
  const weeklyPlan = getEffectiveWeeklyPlan(currentAthlete)
  const exercises = getDayPlan(weeklyPlan, selectedDay).exercises
  const currentExercise = exercises[exerciseIndex]
  const isLastExercise = exerciseIndex === exercises.length - 1
  const sessionXp = Object.values(xpByIndex).reduce((total, xp) => total + xp, 0)
  const isCurrentComplete = currentExercise ? isExerciseComplete(currentExercise, doneByIndex[exerciseIndex]) : true

  function handleDayChange(day: WeekDay) {
    setSelectedDay(day)
    setExerciseIndex(0)
    setXpByIndex({})
    setDoneByIndex({})
    setShowIncompleteWarning(false)
  }

  function handleUnitCompleted() {
    setBursting(true)
    window.setTimeout(() => setBursting(false), 620)
  }

  function handleClose() {
    router.push(`/athletes/${currentAthlete.id}`)
  }

  async function finishOrAdvance() {
    if (isLastExercise) {
      if (sessionXp > 0) {
        await addEvolutionEntry(currentAthlete.id, {
          xpGained: sessionXp,
          note: `${getWeekDayLabel(selectedDay)} — ${exercises.map((exercise) => exercise.name).join(', ')}`,
        })
      }
      router.push(`/athletes/${currentAthlete.id}`)
    } else {
      setExerciseIndex((prev) => prev + 1)
    }
  }

  async function handleNextClick() {
    if (!isCurrentComplete && !showIncompleteWarning) {
      setShowIncompleteWarning(true)
      return
    }
    setShowIncompleteWarning(false)
    await finishOrAdvance()
  }

  function handleBack() {
    setExerciseIndex((prev) => Math.max(prev - 1, 0))
  }

  async function handleSkip() {
    if (currentExercise) {
      setXpByIndex((prev) => ({ ...prev, [exerciseIndex]: 0 }))
      setDoneByIndex((prev) => ({
        ...prev,
        [exerciseIndex]: Array.from({ length: getUnitCount(currentExercise) }, () => false),
      }))
    }
    setShowIncompleteWarning(false)
    await finishOrAdvance()
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
          initialDone={doneByIndex[exerciseIndex]}
          onXpChange={(xp) => setXpByIndex((prev) => ({ ...prev, [exerciseIndex]: xp }))}
          onDoneChange={(done) => setDoneByIndex((prev) => ({ ...prev, [exerciseIndex]: done }))}
          onUnitCompleted={handleUnitCompleted}
        />
      ) : (
        <div className="TrainingSessionPage-empty">
          <p>Nenhum exercício configurado para {getWeekDayLabel(selectedDay)}.</p>
          <Link href={`/athletes/${currentAthlete.id}/plan`}>Configurar plano semanal</Link>
        </div>
      )}

      {currentExercise && (
        <div className="TrainingSessionPage-footer">
          {showIncompleteWarning && (
            <div className="TrainingSessionPage-warning">
              <span>Você ainda não concluiu todas as séries deste exercício.</span>
              <div className="TrainingSessionPage-warningActions">
                <button type="button" className="btn-secondary" onClick={handleNextClick}>
                  Avançar mesmo assim
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowIncompleteWarning(false)}>
                  Continuar treino
                </button>
              </div>
            </div>
          )}

          {exerciseIndex > 0 && (
            <button type="button" className="btn-ghost" onClick={handleBack}>
              ← Exercício anterior
            </button>
          )}
          <button type="button" className="btn-primary" onClick={handleNextClick}>
            {isLastExercise ? 'FINALIZAR SESSÃO' : 'PRÓXIMO EXERCÍCIO'}
          </button>
          {!isLastExercise && (
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
