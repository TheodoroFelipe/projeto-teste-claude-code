import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import type { BodyMeasurementEntry, NewBodyMeasurementInput } from '../types/athlete'
import './BodyMeasurementsPage.css'

interface FieldConfig {
  key: keyof NewBodyMeasurementInput
  label: string
  unit: string
}

const FIELDS: FieldConfig[] = [
  { key: 'weightKg', label: 'Peso', unit: 'kg' },
  { key: 'heightCm', label: 'Altura', unit: 'cm' },
  { key: 'age', label: 'Idade', unit: 'anos' },
  { key: 'armCm', label: 'Braço', unit: 'cm' },
  { key: 'thighCm', label: 'Coxa', unit: 'cm' },
  { key: 'waistCm', label: 'Cintura', unit: 'cm' },
  { key: 'chestCm', label: 'Peito', unit: 'cm' },
  { key: 'beltCm', label: 'Cinturão', unit: 'cm' },
  { key: 'hipCm', label: 'Quadril', unit: 'cm' },
]

type FormValues = Record<keyof NewBodyMeasurementInput, string>

const EMPTY_VALUES: FormValues = {
  weightKg: '',
  heightCm: '',
  age: '',
  armCm: '',
  thighCm: '',
  waistCm: '',
  chestCm: '',
  beltCm: '',
  hipCm: '',
}

function formatValue(entry: BodyMeasurementEntry, field: FieldConfig): string | null {
  const value = entry[field.key]
  return value !== undefined ? `${field.label}: ${value}${field.unit}` : null
}

function BodyMeasurementsPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, addMeasurementEntry } = useAthletes()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)

  if (!athlete) {
    return (
      <div className="BodyMeasurementsPage">
        <p>Atleta não encontrado.</p>
        <Link to="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="BodyMeasurementsPage">
        <p>Você não tem permissão para gerenciar este atleta.</p>
        <Link to={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete = athlete
  const measurements = [...(currentAthlete.measurements ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input: NewBodyMeasurementInput = {}
    for (const field of FIELDS) {
      const raw = values[field.key].trim()
      if (raw) input[field.key] = Number(raw)
    }
    addMeasurementEntry(currentAthlete.id, input)
    setValues(EMPTY_VALUES)
  }

  return (
    <div className="BodyMeasurementsPage">
      <Link className="BodyMeasurementsPage-backLink" to={`/athletes/${athlete.id}`}>
        &larr; Voltar para o perfil
      </Link>
      <h2>Evolução física — {athlete.name}</h2>

      <form className="BodyMeasurementsPage-form" onSubmit={handleSubmit}>
        {FIELDS.map((field) => (
          <label key={field.key}>
            {field.label} ({field.unit})
            <input
              type="number"
              min={0}
              step="0.1"
              value={values[field.key]}
              onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          </label>
        ))}
        <button type="submit">Registrar medidas</button>
      </form>

      <ul className="BodyMeasurementsPage-list">
        {measurements.map((entry) => (
          <li key={entry.id} className="BodyMeasurementsPage-entry">
            <span className="BodyMeasurementsPage-entryDate">
              {new Date(entry.date).toLocaleDateString('pt-BR')}
            </span>
            <span className="BodyMeasurementsPage-entryValues">
              {FIELDS.map((field) => formatValue(entry, field))
                .filter((text): text is string => text !== null)
                .join(' · ')}
            </span>
          </li>
        ))}
        {measurements.length === 0 && <p>Nenhuma medida registrada ainda.</p>}
      </ul>
    </div>
  )
}

export default BodyMeasurementsPage
