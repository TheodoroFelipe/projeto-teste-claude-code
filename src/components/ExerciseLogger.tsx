import { useEffect, useState } from 'react'
import { calcPlannedExerciseXp } from '../utils/plannedExerciseXp'
import { MODALITY_LABELS, formatDuration, summarizePlannedExercise } from '../utils/trainingPlan'
import type { PlannedExercise } from '../types/trainingPlan'
import './ExerciseLogger.css'

const REST_DURATION_SECONDS = 150

interface ExerciseLoggerProps {
  exercise: PlannedExercise
  onXpChange: (xp: number) => void
  onUnitCompleted: () => void
}

function unitCount(exercise: PlannedExercise): number {
  return exercise.modality === 'musculacao' ? exercise.targetSets : 1
}

function ExerciseLogger({ exercise, onXpChange, onUnitCompleted }: ExerciseLoggerProps) {
  const [doneList, setDoneList] = useState<boolean[]>(() => Array.from({ length: unitCount(exercise) }, () => false))
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
    onXpChange(nextDoneList.filter(Boolean).length * perUnitXp)

    if (!wasDone) {
      onUnitCompleted()
      if (isStrength) setRestSeconds(REST_DURATION_SECONDS)
    }
  }

  function handleAddSet() {
    setDoneList((prev) => [...prev, false])
  }

  const nextPendingIndex = doneList.findIndex((done) => !done)

  return (
    <div className="ExerciseLogger">
      <div className="ExerciseLogger-header">
        <span className="ExerciseLogger-name">{exercise.name.toUpperCase()}</span>
        <span className="ExerciseLogger-modality">{MODALITY_LABELS[exercise.modality]}</span>
      </div>

      {isStrength && exercise.modality === 'musculacao' ? (
        <div className="ExerciseLogger-sets">
          {doneList.map((done, index) => (
            <button
              key={index}
              type="button"
              className={`ExerciseLogger-setRow${done ? ' is-done' : ''}`}
              onClick={() => toggle(index)}
            >
              <span className="ExerciseLogger-setLabel">S{index + 1}</span>
              <span className="ExerciseLogger-setValues">
                <span className="ExerciseLogger-setKg">{exercise.targetLoadKg}</span>
                <span className="ExerciseLogger-setReps">kg × {exercise.targetReps}</span>
              </span>
              <span className="ExerciseLogger-setXp">{done ? `+${perUnitXp} XP` : '—'}</span>
              <span className="ExerciseLogger-setCheck">✓</span>
            </button>
          ))}
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
          <span className="ExerciseLogger-completionTarget">{summarizePlannedExercise(exercise)}</span>
          <span className="ExerciseLogger-completionXp">
            {doneList[0] ? `+${perUnitXp} XP` : 'Marcar como concluído'}
          </span>
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
