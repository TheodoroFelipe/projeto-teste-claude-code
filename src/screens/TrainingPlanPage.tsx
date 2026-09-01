'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import DayPlanEditor from '../components/DayPlanEditor'
import { useAthletes } from '../hooks/useAthletes'
import { useCanManageAthlete } from '../hooks/useCanManageAthlete'
import { WEEK_DAYS, getCurrentWeekDay, getDayPlan, getWeeklyPlanOrDefault } from '../utils/trainingPlan'
import type { PlannedExercise, WeeklyPlan } from '../types/trainingPlan'

const SHORT_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

function currentWeekDates(): Date[] {
  const today = new Date()
  const jsDay = today.getDay() // 0 = Sunday
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
}

function TrainingPlanPage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const { getAthleteById, updateWeeklyPlan } = useAthletes()
  const router = useRouter()
  const athlete = athleteId ? getAthleteById(athleteId) : undefined
  const canManage = useCanManageAthlete(athleteId)
  const [draftPlan, setDraftPlan] = useState<WeeklyPlan | null>(null)
  const currentDayIndex = WEEK_DAYS.findIndex(({ day }) => day === getCurrentWeekDay())
  const [selectedDayIndex, setSelectedDayIndex] = useState(Math.max(currentDayIndex, 0))

  if (!athlete) {
    return (
      <div className="Page">
        <p className="Page-empty">Atleta não encontrado.</p>
        <Link href="/">Voltar para a lista</Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="Page">
        <p className="Page-empty">Você não tem permissão para gerenciar este atleta.</p>
        <Link href={`/athletes/${athlete.id}`}>Voltar para o perfil</Link>
      </div>
    )
  }

  const currentAthlete = athlete
  const weeklyPlan = draftPlan ?? getWeeklyPlanOrDefault(currentAthlete)
  const dates = currentWeekDates()

  function handleAdd(dayIndex: number, exercise: PlannedExercise) {
    setDraftPlan(
      weeklyPlan.map((dayPlan, index) =>
        index === dayIndex ? { ...dayPlan, exercises: [...dayPlan.exercises, exercise] } : dayPlan,
      ),
    )
  }

  function handleEdit(dayIndex: number, exercise: PlannedExercise) {
    setDraftPlan(
      weeklyPlan.map((dayPlan, index) =>
        index === dayIndex
          ? { ...dayPlan, exercises: dayPlan.exercises.map((e) => (e.id === exercise.id ? exercise : e)) }
          : dayPlan,
      ),
    )
  }

  function handleRemove(dayIndex: number, exerciseId: string) {
    setDraftPlan(
      weeklyPlan.map((dayPlan, index) =>
        index === dayIndex
          ? { ...dayPlan, exercises: dayPlan.exercises.filter((exercise) => exercise.id !== exerciseId) }
          : dayPlan,
      ),
    )
  }

  async function handleSave() {
    await updateWeeklyPlan(currentAthlete.id, weeklyPlan)
    router.push(`/athletes/${currentAthlete.id}`)
  }

  const selectedDayPlan = getDayPlan(weeklyPlan, WEEK_DAYS[selectedDayIndex].day)

  return (
    <div className="Page">
      <div className="TrainingPlanPage-topbar">
        <Link className="Page-backLink" href={`/athletes/${athlete.id}`}>
          &larr; Voltar
        </Link>
        <span className="TrainingPlanPage-title">Plano semanal</span>
      </div>
      <div className="TrainingPlanPage-subhead">
        <span className="avatar TrainingPlanPage-avatarXs">{athlete.name.slice(0, 2).toUpperCase()}</span>
        <span className="TrainingPlanPage-subheadText">
          {athlete.name} · {athlete.sport}
        </span>
      </div>

      <div className="TrainingPlanPage-dayRow">
        {WEEK_DAYS.map(({ day }, index) => {
          const hasExercises = getDayPlan(weeklyPlan, day).exercises.length > 0
          return (
            <button
              key={day}
              type="button"
              className={`TrainingPlanPage-dayPill${index === selectedDayIndex ? ' active' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
            >
              <span>{SHORT_LABELS[index]}</span>
              <span className="num">{dates[index].getDate()}</span>
              <span className={`TrainingPlanPage-dayDot${hasExercises ? '' : ' empty'}`} />
            </button>
          )
        })}
      </div>

      <DayPlanEditor
        key={WEEK_DAYS[selectedDayIndex].day}
        dayLabel={WEEK_DAYS[selectedDayIndex].label}
        exercises={selectedDayPlan.exercises}
        onAdd={(exercise) => handleAdd(selectedDayIndex, exercise)}
        onEdit={(exercise) => handleEdit(selectedDayIndex, exercise)}
        onRemove={(exerciseId) => handleRemove(selectedDayIndex, exerciseId)}
      />

      <button type="button" className="btn-primary" onClick={handleSave}>
        SALVAR PLANO
      </button>
    </div>
  )
}

export default TrainingPlanPage
