'use client'

import { useEffect, useState } from 'react'
import { calcPlannedExerciseXp } from '../utils/plannedExerciseXp'
import { formatDuration, getUnitCount, summarizePlannedExercise } from '../utils/trainingPlan'
import type { PlannedExercise } from '../types/trainingPlan'

const REST_DURATION_SECONDS = 150

interface ExerciseLoggerProps {
  exercise: PlannedExercise
  initialDone?: boolean[]
  onXpChange: (xp: number) => void
  onDoneChange: (done: boolean[]) => void
  onUnitCompleted: () => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

function ExerciseLogger({ exercise, initialDone, onXpChange, onDoneChange, onUnitCompleted }: ExerciseLoggerProps) {
  const [doneList, setDoneList] = useState<boolean[]>(
    () => initialDone ?? Array.from({ length: getUnitCount(exercise) }, () => false),
  )
  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const isStrength = exercise.modality === 'musculacao'
  const perUnitXp = calcPlannedExerciseXp(exercise)

  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return
    const timeout = window.setTimeout(() => {
      setRestSeconds((prev) => (prev !== null ? prev - 1 : prev))
    }, 1000)
    return () => window.clearTimeout(timeout)
  }, [restSeconds])

  function toggle(index: number) {
    const wasDone = doneList[index]
    const nextDoneList = doneList.map((value, i) => (i === index ? !value : value))
    setDoneList(nextDoneList)
    onDoneChange(nextDoneList)
    onXpChange(nextDoneList.filter(Boolean).length * perUnitXp)

    if (!wasDone) {
      onUnitCompleted()
      if (isStrength) setRestSeconds(REST_DURATION_SECONDS)
    }
  }

  function handleAddSet() {
    setDoneList((prev) => {
      const next = [...prev, false]
      onDoneChange(next)
      return next
    })
  }

  const nextPendingIndex = doneList.findIndex((done) => !done)

  return (
    <div className="ExerciseLogger">
      <div className="ExerciseLogger-hero">
        <div className="ExerciseLogger-name">{exercise.name}</div>
        <div className="ExerciseLogger-target">Meta: {summarizePlannedExercise(exercise)}</div>
      </div>

      {isStrength && exercise.modality === 'musculacao' ? (
        <div className="ExerciseLogger-sets">
          {doneList.map((done, index) => {
            const status = done ? 'done' : index === nextPendingIndex ? 'active' : 'pending'
            return (
              <button
                key={index}
                type="button"
                className={`ExerciseLogger-setRow ExerciseLogger-setRow-${status}`}
                onClick={() => toggle(index)}
              >
                <span className={`ExerciseLogger-setStatus ExerciseLogger-setStatus-${status}`}>
                  {done ? <CheckIcon /> : index + 1}
                </span>
                <span className="ExerciseLogger-setLabel">Série {index + 1}</span>
                <span className="ExerciseLogger-setValues">
                  {exercise.targetReps} reps · {exercise.targetLoadKg} kg
                </span>
                <span className="ExerciseLogger-setXp">{done ? `+${perUnitXp} XP` : ''}</span>
              </button>
            )
          })}
          <button type="button" className="ExerciseLogger-addSet" onClick={handleAddSet}>
            ＋ Adicionar série extra
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`ExerciseLogger-completionCard${doneList[0] ? ' is-done' : ''}`}
          onClick={() => toggle(0)}
        >
          <span className={`ExerciseLogger-setStatus ExerciseLogger-setStatus-${doneList[0] ? 'done' : 'active'}`}>
            {doneList[0] ? <CheckIcon /> : ''}
          </span>
          <span className="ExerciseLogger-completionXp">{doneList[0] ? `+${perUnitXp} XP` : 'Marcar como concluído'}</span>
        </button>
      )}

      {isStrength && restSeconds !== null && restSeconds > 0 && exercise.modality === 'musculacao' && (
        <div className="ExerciseLogger-rest">
          <span className="ExerciseLogger-restLabel">Descanso</span>
          <span className="ExerciseLogger-restNext">
            {nextPendingIndex === -1
              ? 'Última série registrada'
              : `Próxima: ${exercise.targetLoadKg} kg × ${exercise.targetReps}`}
          </span>
          <span className="ExerciseLogger-restTimer">{formatDuration(restSeconds)}</span>
        </div>
      )}
    </div>
  )
}

export default ExerciseLogger
