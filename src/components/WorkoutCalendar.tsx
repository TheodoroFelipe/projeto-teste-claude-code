'use client'

import { useState } from 'react'
import type { EvolutionEntry } from '../types/athlete'

interface WorkoutCalendarProps {
  evolutionHistory: EvolutionEntry[]
}

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function WorkoutCalendar({ evolutionHistory }: WorkoutCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const trainedDays = new Set(evolutionHistory.map((entry) => toDayKey(new Date(entry.date))))
  const todayKey = toDayKey(new Date())

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const leadingBlanks = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const trainedInMonth = Array.from({ length: daysInMonth }, (_, index) =>
    trainedDays.has(toDayKey(new Date(year, month, index + 1))),
  ).filter(Boolean).length

  const monthLabel = visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function changeMonth(offset: number) {
    setVisibleMonth(new Date(year, month + offset, 1))
  }

  return (
    <div className="card WorkoutCalendar">
      <div className="WorkoutCalendar-header">
        <button type="button" className="WorkoutCalendar-nav" aria-label="Mês anterior" onClick={() => changeMonth(-1)}>
          &lsaquo;
        </button>
        <div className="WorkoutCalendar-title">
          <span className="WorkoutCalendar-month">{monthLabel}</span>
          <span className="WorkoutCalendar-count">
            {trainedInMonth} {trainedInMonth === 1 ? 'treino concluído' : 'treinos concluídos'}
          </span>
        </div>
        <button type="button" className="WorkoutCalendar-nav" aria-label="Próximo mês" onClick={() => changeMonth(1)}>
          &rsaquo;
        </button>
      </div>

      <div className="WorkoutCalendar-grid">
        {WEEKDAY_INITIALS.map((initial, index) => (
          <span key={index} className="WorkoutCalendar-weekday">
            {initial}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1
          const key = toDayKey(new Date(year, month, day))
          const trained = trainedDays.has(key)
          const classes = ['WorkoutCalendar-day']
          if (trained) classes.push('WorkoutCalendar-day--trained')
          if (key === todayKey) classes.push('WorkoutCalendar-day--today')
          return (
            <span key={day} className={classes.join(' ')} aria-label={trained ? `Dia ${day}: treino concluído` : undefined}>
              {day}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default WorkoutCalendar
