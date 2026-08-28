import type { Modality } from '../types/trainingPlan'

export interface PlannedExerciseFieldsValue {
  sets: string
  reps: string
  loadKg: string
  distance: string
  duration: string
  notes: string
}

interface PlannedExerciseFieldsProps {
  modality: Modality
  value: PlannedExerciseFieldsValue
  onChange: (value: PlannedExerciseFieldsValue) => void
}

function PlannedExerciseFields({ modality, value, onChange }: PlannedExerciseFieldsProps) {
  function set<K extends keyof PlannedExerciseFieldsValue>(key: K, fieldValue: string) {
    onChange({ ...value, [key]: fieldValue })
  }

  if (modality === 'musculacao') {
    return (
      <>
        <label>
          Séries
          <input type="number" min={1} value={value.sets} onChange={(event) => set('sets', event.target.value)} />
        </label>
        <label>
          Repetições
          <input type="number" min={1} value={value.reps} onChange={(event) => set('reps', event.target.value)} />
        </label>
        <label>
          Carga (kg)
          <input
            type="number"
            min={0}
            step="0.5"
            value={value.loadKg}
            onChange={(event) => set('loadKg', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (modality === 'corrida' || modality === 'ciclismo') {
    return (
      <>
        <label>
          Distância (km)
          <input
            type="number"
            min={0}
            step="0.1"
            value={value.distance}
            onChange={(event) => set('distance', event.target.value)}
          />
        </label>
        <label>
          Duração (min)
          <input
            type="number"
            min={1}
            value={value.duration}
            onChange={(event) => set('duration', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (modality === 'natacao') {
    return (
      <>
        <label>
          Distância (m)
          <input
            type="number"
            min={0}
            step="1"
            value={value.distance}
            onChange={(event) => set('distance', event.target.value)}
          />
        </label>
        <label>
          Duração (min)
          <input
            type="number"
            min={1}
            value={value.duration}
            onChange={(event) => set('duration', event.target.value)}
          />
        </label>
      </>
    )
  }

  return (
    <>
      <label>
        Duração (min)
        <input type="number" min={1} value={value.duration} onChange={(event) => set('duration', event.target.value)} />
      </label>
      <label>
        Notas
        <input type="text" value={value.notes} onChange={(event) => set('notes', event.target.value)} />
      </label>
    </>
  )
}

export default PlannedExerciseFields
