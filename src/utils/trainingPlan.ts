import type { Athlete } from '../types/athlete'
import type { DayPlan, Modality, PlannedExercise, WeekDay, WeeklyPlan } from '../types/trainingPlan'

export const MODALITY_OPTIONS: Modality[] = ['musculacao', 'corrida', 'ciclismo', 'natacao', 'outro']

export const MODALITY_LABELS: Record<Modality, string> = {
  musculacao: 'Musculação',
  corrida: 'Corrida',
  ciclismo: 'Ciclismo',
  natacao: 'Natação',
  outro: 'Outro',
}

export function summarizePlannedExercise(exercise: PlannedExercise): string {
  switch (exercise.modality) {
    case 'musculacao':
      return `${exercise.targetSets}x${exercise.targetReps} @ ${exercise.targetLoadKg}kg`
    case 'corrida':
    case 'ciclismo':
      return `${exercise.targetDistanceKm}km em ${exercise.targetDurationMin}min`
    case 'natacao':
      return `${exercise.targetDistanceMeters}m em ${exercise.targetDurationMin}min`
    case 'outro':
      return exercise.notes ? `${exercise.targetDurationMin}min · ${exercise.notes}` : `${exercise.targetDurationMin}min`
  }
}

interface WeekDayInfo {
  day: WeekDay
  label: string
}

export const WEEK_DAYS: WeekDayInfo[] = [
  { day: 'monday', label: 'Segunda' },
  { day: 'tuesday', label: 'Terça' },
  { day: 'wednesday', label: 'Quarta' },
  { day: 'thursday', label: 'Quinta' },
  { day: 'friday', label: 'Sexta' },
  { day: 'saturday', label: 'Sábado' },
  { day: 'sunday', label: 'Domingo' },
]

export function getWeekDayLabel(day: WeekDay): string {
  return WEEK_DAYS.find((entry) => entry.day === day)?.label ?? day
}

export function getCurrentWeekDay(): WeekDay {
  const jsDayIndex = new Date().getDay() // 0 = Sunday
  const orderedByJsIndex: WeekDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return orderedByJsIndex[jsDayIndex]
}

export function createEmptyWeeklyPlan(): WeeklyPlan {
  return WEEK_DAYS.map(({ day }): DayPlan => ({ day, exercises: [] }))
}

export function getWeeklyPlanOrDefault(athlete: Athlete): WeeklyPlan {
  return athlete.weeklyPlan ?? createEmptyWeeklyPlan()
}

export function getDayPlan(weeklyPlan: WeeklyPlan, day: WeekDay): DayPlan {
  return weeklyPlan.find((entry) => entry.day === day) ?? { day, exercises: [] }
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
