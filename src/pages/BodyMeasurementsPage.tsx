import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import TrendLineChart from '../components/TrendLineChart'
import type { TrendChartPoint, TrendChartSeries } from '../components/TrendLineChart'
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

const MEASUREMENT_FIELDS = FIELDS.filter((field) => field.key !== 'weightKg' && field.key !== 'heightCm' && field.key !== 'age')

const CATEGORICAL_COLORS = ['#a3e635', '#fb923c', '#38bdf8', '#f472b6', '#c084fc', '#facc15']

const MEASUREMENT_SERIES: TrendChartSeries[] = MEASUREMENT_FIELDS.map((field, index) => ({
  key: field.key,
  label: field.label,
  color: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
}))

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

type RangeKey = '7d' | '30d' | '90d' | '1a'

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '1a', label: '1A', days: 365 },
]

function filterByRange(measurements: BodyMeasurementEntry[], range: RangeKey): BodyMeasurementEntry[] {
  const days = RANGES.find((r) => r.key === range)?.days ?? 30
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return measurements.filter((entry) => new Date(entry.date).getTime() >= cutoff)
}

function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${Number(delta.toFixed(1))}`
}

function BodyMeasurementsPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, addMeasurementEntry } = useAthletes()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [tab, setTab] = useState<'peso' | 'medidas'>('peso')
  const [range, setRange] = useState<RangeKey>('30d')

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
  const measurements = currentAthlete.measurements ?? []
  const sortedDesc = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const sortedAsc = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const rangeFilteredAsc = filterByRange(sortedAsc, range)

  const chartPoints: TrendChartPoint[] = rangeFilteredAsc.map((entry) => ({
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

  const latest = sortedDesc[0]
  const previous = sortedDesc[1]

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
    <div className="Page Page-wide">
      <h1 className="Page-title">Evolução física — {athlete.name}</h1>

      <form className="card BodyMeasurementsPage-form" onSubmit={handleSubmit}>
        <div className="section-title">Registrar novas medidas</div>
        <div className="BodyMeasurementsPage-formGrid">
          {FIELDS.map((field) => (
            <div className="field-group" key={field.key}>
              <label htmlFor={`measurement-${field.key}`}>
                {field.label} ({field.unit})
              </label>
              <input
                id={`measurement-${field.key}`}
                type="number"
                min={0}
                step="0.1"
                value={values[field.key]}
                onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="btn-primary">
          Registrar medidas
        </button>
      </form>

      {measurements.length === 0 ? (
        <p className="Page-empty">Nenhuma medida registrada ainda.</p>
      ) : (
        <>
          <div className="segmented">
            <button type="button" className={`segmented-item${tab === 'peso' ? ' active' : ''}`} onClick={() => setTab('peso')}>
              Peso
            </button>
            <button
              type="button"
              className={`segmented-item${tab === 'medidas' ? ' active' : ''}`}
              onClick={() => setTab('medidas')}
            >
              Medidas
            </button>
          </div>

          <div className="card">
            {tab === 'peso' && latest?.weightKg !== undefined ? (
              <div className="BodyMeasurementsPage-metricRow">
                <span className="BodyMeasurementsPage-metricValue">{latest.weightKg} kg</span>
                {previous?.weightKg !== undefined && (
                  <span className={`stat-tile-delta ${latest.weightKg <= previous.weightKg ? 'down' : 'up'}`}>
                    {formatDelta(latest.weightKg - previous.weightKg)} kg
                  </span>
                )}
              </div>
            ) : (
              <div className="BodyMeasurementsPage-metricLabel">Nenhum registro de peso ainda.</div>
            )}
            <div className="BodyMeasurementsPage-metricLabel">Período selecionado: {RANGES.find((r) => r.key === range)?.label}</div>

            <div className="BodyMeasurementsPage-rangeChips">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`BodyMeasurementsPage-rangeChip${range === r.key ? ' active' : ''}`}
                  onClick={() => setRange(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="BodyMeasurementsPage-chartWrap">
              <TrendLineChart points={chartPoints} series={tab === 'peso' ? WEIGHT_SERIES : MEASUREMENT_SERIES} unit={tab === 'peso' ? 'kg' : 'cm'} />
            </div>
          </div>

          {tab === 'medidas' && (
            <div>
              <div className="section-title" style={{ marginBottom: 10 }}>
                Medidas corporais
              </div>
              <div className="stat-grid">
                {MEASUREMENT_FIELDS.map((field) => {
                  const latestValue = latest?.[field.key]
                  const previousValue = previous?.[field.key]
                  const delta = latestValue !== undefined && previousValue !== undefined ? latestValue - previousValue : undefined
                  return (
                    <div className="stat-tile" key={field.key}>
                      <span className="stat-tile-label">{field.label}</span>
                      <div className="stat-tile-row">
                        <span className="stat-tile-value">{latestValue !== undefined ? `${latestValue} cm` : '—'}</span>
                        {delta !== undefined && (
                          <span className={`stat-tile-delta ${delta <= 0 ? 'down' : 'up'}`}>{formatDelta(delta)}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <div className="section-title" style={{ marginBottom: 10 }}>
              Histórico completo
            </div>
            <div className="table-wrap">
              <table className="data-table">
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
          </div>
        </>
      )}
    </div>
  )
}

export default BodyMeasurementsPage
