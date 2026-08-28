import { useState } from 'react'
import type { FormEvent } from 'react'
import PlannedExerciseFields from './PlannedExerciseFields'
import type { PlannedExerciseFieldsValue } from './PlannedExerciseFields'
import { generateId } from '../utils/id'
import { MODALITY_LABELS, MODALITY_OPTIONS, summarizePlannedExercise } from '../utils/trainingPlan'
import type { Modality, PlannedExercise } from '../types/trainingPlan'
import './DayPlanEditor.css'

const EMPTY_FIELDS: PlannedExerciseFieldsValue = {
  sets: '3',
  reps: '10',
  loadKg: '20',
  distance: '5',
  duration: '30',
  notes: '',
}

interface DayPlanEditorProps {
  dayLabel: string
  exercises: PlannedExercise[]
  onAdd: (exercise: PlannedExercise) => void
  onRemove: (exerciseId: string) => void
}

function buildExercise(name: string, modality: Modality, fields: PlannedExerciseFieldsValue): PlannedExercise {
  const id = generateId()

  switch (modality) {
    case 'musculacao':
      return {
        id,
        name,
        modality,
        targetSets: Number(fields.sets),
        targetReps: Number(fields.reps),
        targetLoadKg: Number(fields.loadKg),
      }
    case 'corrida':
    case 'ciclismo':
      return {
        id,
        name,
        modality,
        targetDistanceKm: Number(fields.distance),
        targetDurationMin: Number(fields.duration),
      }
    case 'natacao':
      return {
        id,
        name,
        modality,
        targetDistanceMeters: Number(fields.distance),
        targetDurationMin: Number(fields.duration),
      }
    case 'outro':
      return {
        id,
        name,
        modality,
        targetDurationMin: Number(fields.duration),
        notes: fields.notes.trim() || undefined,
      }
  }
}

function DayPlanEditor({ dayLabel, exercises, onAdd, onRemove }: DayPlanEditorProps) {
  const [modality, setModality] = useState<Modality>('musculacao')
  const [name, setName] = useState('')
  const [fields, setFields] = useState<PlannedExerciseFieldsValue>(EMPTY_FIELDS)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    onAdd(buildExercise(name.trim(), modality, fields))
    setName('')
    setFields(EMPTY_FIELDS)
  }

  return (
    <div className="DayPlanEditor">
      <h3 className="DayPlanEditor-day">{dayLabel}</h3>

      {exercises.length === 0 ? (
        <p className="DayPlanEditor-empty">Nenhum exercício configurado.</p>
      ) : (
        <ul className="DayPlanEditor-list">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="DayPlanEditor-item">
              <span className="DayPlanEditor-itemName">{exercise.name}</span>
              <span className="DayPlanEditor-itemModality">{MODALITY_LABELS[exercise.modality]}</span>
              <span className="DayPlanEditor-itemSummary">{summarizePlannedExercise(exercise)}</span>
              <button type="button" onClick={() => onRemove(exercise.id)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="DayPlanEditor-form" onSubmit={handleSubmit}>
        <label>
          Nome do exercício
          <input type="text" required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Modalidade
          <select
            value={modality}
            onChange={(event) => {
              const nextModality = event.target.value as Modality
              setModality(nextModality)
              if (nextModality === 'natacao') {
                setFields((prev) => ({ ...prev, distance: '1000' }))
              } else if (nextModality === 'corrida' || nextModality === 'ciclismo') {
                setFields((prev) => ({ ...prev, distance: '5' }))
              }
            }}
          >
            {MODALITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {MODALITY_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <PlannedExerciseFields modality={modality} value={fields} onChange={setFields} />
        <button type="submit">Adicionar exercício</button>
      </form>
    </div>
  )
}

export default DayPlanEditor
