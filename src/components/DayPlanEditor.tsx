'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import PlannedExerciseFields from './PlannedExerciseFields'
import type { PlannedExerciseFieldsValue } from './PlannedExerciseFields'
import { generateId } from '../utils/id'
import { MODALITY_LABELS, MODALITY_OPTIONS, summarizePlannedExercise } from '../utils/trainingPlan'
import type { Modality, PlannedExercise } from '../types/trainingPlan'

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
  onEdit: (exercise: PlannedExercise) => void
  onRemove: (exerciseId: string) => void
}

function exerciseToFieldsValue(exercise: PlannedExercise): PlannedExerciseFieldsValue {
  switch (exercise.modality) {
    case 'musculacao':
      return {
        ...EMPTY_FIELDS,
        sets: String(exercise.targetSets),
        reps: String(exercise.targetReps),
        loadKg: String(exercise.targetLoadKg),
      }
    case 'corrida':
    case 'ciclismo':
      return { ...EMPTY_FIELDS, distance: String(exercise.targetDistanceKm), duration: String(exercise.targetDurationMin) }
    case 'natacao':
      return { ...EMPTY_FIELDS, distance: String(exercise.targetDistanceMeters), duration: String(exercise.targetDurationMin) }
    case 'outro':
      return { ...EMPTY_FIELDS, duration: String(exercise.targetDurationMin), notes: exercise.notes ?? '' }
  }
}

function buildExercise(
  name: string,
  modality: Modality,
  fields: PlannedExerciseFieldsValue,
  id: string = generateId(),
): PlannedExercise {
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

function DayPlanEditor({ dayLabel, exercises, onAdd, onEdit, onRemove }: DayPlanEditorProps) {
  const [modality, setModality] = useState<Modality>('musculacao')
  const [name, setName] = useState('')
  const [fields, setFields] = useState<PlannedExerciseFieldsValue>(EMPTY_FIELDS)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function resetForm() {
    setName('')
    setFields(EMPTY_FIELDS)
    setModality('musculacao')
    setIsAdding(false)
    setEditingId(null)
  }

  function startAdd() {
    setEditingId(null)
    setName('')
    setFields(EMPTY_FIELDS)
    setModality('musculacao')
    setIsAdding(true)
  }

  function startEdit(exercise: PlannedExercise) {
    setEditingId(exercise.id)
    setName(exercise.name)
    setModality(exercise.modality)
    setFields(exerciseToFieldsValue(exercise))
    setIsAdding(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    if (editingId) {
      onEdit(buildExercise(name.trim(), modality, fields, editingId))
    } else {
      onAdd(buildExercise(name.trim(), modality, fields))
    }
    resetForm()
  }

  return (
    <div className="DayPlanEditor">
      <div className="section-title DayPlanEditor-day">{dayLabel}</div>

      <div className="DayPlanEditor-list">
        {exercises.length === 0 && !isAdding && <p className="DayPlanEditor-empty">Nenhum exercício configurado.</p>}

        {exercises.map((exercise) => (
          <div key={exercise.id} className="DayPlanEditor-item">
            <div className="DayPlanEditor-itemIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9v6" />
                <path d="M2 10v4" />
                <path d="M20 9v6" />
                <path d="M22 10v4" />
                <path d="M6 12h12" />
                <path d="M6 8.5v7" />
                <path d="M18 8.5v7" />
              </svg>
            </div>
            <div className="DayPlanEditor-itemInfo">
              <div className="DayPlanEditor-itemName">{exercise.name}</div>
              <div className="DayPlanEditor-itemDetail">
                {MODALITY_LABELS[exercise.modality]} · {summarizePlannedExercise(exercise)}
              </div>
            </div>
            <div className="DayPlanEditor-itemActions">
              <button
                type="button"
                className="DayPlanEditor-editButton"
                onClick={() => startEdit(exercise)}
                aria-label={`Editar ${exercise.name}`}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                type="button"
                className="DayPlanEditor-removeButton"
                onClick={() => onRemove(exercise.id)}
                aria-label={`Remover ${exercise.name}`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {isAdding ? (
          <form className="DayPlanEditor-form" onSubmit={handleSubmit}>
            <div className="section-title">{editingId ? 'Editar exercício' : 'Novo exercício'}</div>
            <div className="field-group">
              <label htmlFor="new-exercise-name">Nome do exercício</label>
              <input
                id="new-exercise-name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="new-exercise-modality">Modalidade</label>
              <select
                id="new-exercise-modality"
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
            </div>
            <div className="DayPlanEditor-fieldsRow">
              <PlannedExerciseFields modality={modality} value={fields} onChange={setFields} />
            </div>
            <div className="DayPlanEditor-formActions">
              <button type="submit" className="btn-secondary">
                {editingId ? 'Salvar alterações' : 'Adicionar'}
              </button>
              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="DayPlanEditor-addButton" onClick={startAdd}>
            + Adicionar exercício
          </button>
        )}
      </div>
    </div>
  )
}

export default DayPlanEditor
