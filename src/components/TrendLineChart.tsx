'use client'

import { useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'

export interface TrendChartSeries {
  key: string
  label: string
  color: string
}

export interface TrendChartPoint {
  dateLabel: string
  values: Record<string, number | undefined>
}

interface TrendLineChartProps {
  points: TrendChartPoint[]
  series: TrendChartSeries[]
  unit: string
}

const WIDTH = 640
const HEIGHT = 260
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 }
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom

const SURFACE = '#262a3a'
const TEXT_SECONDARY = '#d8dae3'
const MUTED = '#8b90a3'
const GRIDLINE = 'rgba(148, 152, 175, 0.22)'
const BASELINE = 'rgba(148, 152, 175, 0.4)'

interface DefinedEntry {
  index: number
  value: number
}

function splitIntoRuns(entries: DefinedEntry[]): DefinedEntry[][] {
  const runs: DefinedEntry[][] = []
  let currentRun: DefinedEntry[] = []
  let lastIndex: number | null = null

  for (const entry of entries) {
    if (lastIndex !== null && entry.index !== lastIndex + 1) {
      runs.push(currentRun)
      currentRun = []
    }
    currentRun.push(entry)
    lastIndex = entry.index
  }
  if (currentRun.length > 0) runs.push(currentRun)

  return runs
}

function TrendLineChart({ points, series, unit }: TrendLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeSeries = series.filter((s) => points.some((point) => point.values[s.key] !== undefined))
  const allValues = points.flatMap((point) =>
    activeSeries.map((s) => point.values[s.key]).filter((value): value is number => value !== undefined),
  )

  if (points.length === 0 || allValues.length === 0) {
    return <p className="TrendLineChart-empty">Registre ao menos uma medição para ver o gráfico.</p>
  }

  const yMin = Math.min(...allValues)
  const yMax = Math.max(...allValues)
  const yPadding = (yMax - yMin) * 0.15 || Math.max(yMax * 0.1, 1)
  const domainMin = yMin - yPadding
  const domainMax = yMax + yPadding

  function yToPixel(value: number): number {
    return PADDING.top + PLOT_HEIGHT - ((value - domainMin) / (domainMax - domainMin)) * PLOT_HEIGHT
  }

  function xToPixel(index: number): number {
    if (points.length === 1) return PADDING.left + PLOT_WIDTH / 2
    return PADDING.left + (index / (points.length - 1)) * PLOT_WIDTH
  }

  const yTickCount = 4
  const tickDecimals = domainMax - domainMin < yTickCount ? 1 : 0
  const gridLines = Array.from({ length: yTickCount + 1 }, (_, tickIndex) => {
    const value = domainMin + ((domainMax - domainMin) * tickIndex) / yTickCount
    return { value, y: yToPixel(value), label: value.toFixed(tickDecimals) }
  })

  const labelStep = points.length <= 6 ? 1 : Math.ceil(points.length / 6)

  function updateActiveFromClientX(clientX: number) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scale = WIDTH / rect.width
    const internalX = (clientX - rect.left) * scale
    const ratio = (internalX - PADDING.left) / PLOT_WIDTH
    const index = Math.round(ratio * (points.length - 1))
    setActiveIndex(Math.min(Math.max(index, 0), points.length - 1))
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    updateActiveFromClientX(event.clientX)
  }

  function handleKeyDown(event: ReactKeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowRight') {
      setActiveIndex((prev) => Math.min((prev ?? -1) + 1, points.length - 1))
    } else if (event.key === 'ArrowLeft') {
      setActiveIndex((prev) => Math.max((prev ?? points.length) - 1, 0))
    }
  }

  const active = activeIndex !== null ? points[activeIndex] : null

  return (
    <div className="TrendLineChart">
      {activeSeries.length > 1 && (
        <div className="TrendLineChart-legend">
          {activeSeries.map((s) => (
            <span key={s.key} className="TrendLineChart-legendItem">
              <span className="TrendLineChart-legendLine" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <svg
        ref={svgRef}
        className="TrendLineChart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Gráfico de evolução em ${unit}`}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActiveIndex(null)}
        onKeyDown={handleKeyDown}
      >
        {gridLines.map((line) => (
          <g key={line.value}>
            <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={line.y} y2={line.y} stroke={GRIDLINE} strokeWidth={1} />
            <text x={PADDING.left - 8} y={line.y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={MUTED}>
              {line.label}
            </text>
          </g>
        ))}

        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={PADDING.top + PLOT_HEIGHT}
          y2={PADDING.top + PLOT_HEIGHT}
          stroke={BASELINE}
          strokeWidth={1}
        />

        {points.map((point, index) => {
          if (index % labelStep !== 0 && index !== points.length - 1) return null
          const textAnchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'
          return (
            <text
              key={`${point.dateLabel}-${index}`}
              x={xToPixel(index)}
              y={HEIGHT - 8}
              textAnchor={textAnchor}
              fontSize={10}
              fill={MUTED}
            >
              {point.dateLabel}
            </text>
          )
        })}

        {activeSeries.map((s) => {
          const definedEntries: DefinedEntry[] = points
            .map((point, index) => ({ index, value: point.values[s.key] }))
            .filter((entry): entry is DefinedEntry => entry.value !== undefined)

          const runs = splitIntoRuns(definedEntries)

          return (
            <g key={s.key}>
              {runs.map((run, runIndex) => (
                <polyline
                  key={runIndex}
                  points={run.map((entry) => `${xToPixel(entry.index)},${yToPixel(entry.value)}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {definedEntries.map((entry) => (
                <circle
                  key={entry.index}
                  cx={xToPixel(entry.index)}
                  cy={yToPixel(entry.value)}
                  r={4}
                  fill={s.color}
                  stroke={SURFACE}
                  strokeWidth={2}
                />
              ))}
            </g>
          )
        })}

        {activeIndex !== null && (
          <line
            x1={xToPixel(activeIndex)}
            x2={xToPixel(activeIndex)}
            y1={PADDING.top}
            y2={PADDING.top + PLOT_HEIGHT}
            stroke={TEXT_SECONDARY}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {active && (
        <div className="TrendLineChart-tooltip">
          <div className="TrendLineChart-tooltipDate">{active.dateLabel}</div>
          {activeSeries.map((s) => {
            const value = active.values[s.key]
            if (value === undefined) return null
            return (
              <div key={s.key} className="TrendLineChart-tooltipRow">
                <span className="TrendLineChart-tooltipKey" style={{ background: s.color }} />
                <span className="TrendLineChart-tooltipLabel">{s.label}</span>
                <span className="TrendLineChart-tooltipValue">
                  {value}
                  {unit}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TrendLineChart
