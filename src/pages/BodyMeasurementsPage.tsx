import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import TrendLineChart from '../components/TrendLineChart'
import type { TrendChartPoint, TrendChartSeries } from '../components/TrendLineChart'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import type { NewBodyMeasurementInput } from '../types/athlete'
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

const CATEGORICAL_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7']

const MEASUREMENT_SERIES: TrendChartSeries[] = [
  { key: 'armCm', label: 'Braço', color: CATEGORICAL_COLORS[0] },
  { key: 'thighCm', label: 'Coxa', color: CATEGORICAL_COLORS[1] },
  { key: 'waistCm', label: 'Cintura', color: CATEGORICAL_COLORS[2] },
  { key: 'chestCm', label: 'Peito', color: CATEGORICAL_COLORS[3] },
  { key: 'beltCm', label: 'Cinturão', color: CATEGORICAL_COLORS[4] },
  { key: 'hipCm', label: 'Quadril', color: CATEGORICAL_COLORS[5] },
]

const WEIGHT_SERIES: TrendChartSeries[] = [{ key: 'weightKg', label: 'Peso', color: CATEGORICAL_COLORS[0] }]

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
  const measurements = currentAthlete.measurements ?? []
  const sortedDesc = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const sortedAsc = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartPoints: TrendChartPoint[] = sortedAsc.map((entry) => ({
    dateLabel: new Date(entry.date).toLocaleDateString('pt-BR'),
    values: {
      weightKg: entry.weightKg,
      armCm: entry.armCm,
      thighCm: entry.thighCm,
      waistCm: entry.waistCm,
      chestCm: entry.chestCm,
      beltCm: entry.beltCm,
      hipCm: entry.hipCm,
    },
  }))

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

      {measurements.length === 0 ? (
        <p>Nenhuma medida registrada ainda.</p>
      ) : (
        <>
          <section className="BodyMeasurementsPage-section">
            <h3>Evolução do peso</h3>
            <TrendLineChart points={chartPoints} series={WEIGHT_SERIES} unit="kg" />
          </section>

          <section className="BodyMeasurementsPage-section">
            <h3>Evolução das medidas</h3>
            <TrendLineChart points={chartPoints} series={MEASUREMENT_SERIES} unit="cm" />
          </section>

          <section className="BodyMeasurementsPage-section">
            <h3>Histórico</h3>
            <div className="BodyMeasurementsPage-tableWrap">
              <table className="BodyMeasurementsPage-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    {FIELDS.map((field) => (
                      <th key={field.key}>
                        {field.label} ({field.unit})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDesc.map((entry) => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                      {FIELDS.map((field) => (
                        <td key={field.key}>{entry[field.key] ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default BodyMeasurementsPage
