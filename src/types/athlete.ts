import type { WeeklyPlan } from './trainingPlan'
import type { AssignedCoachPlan } from './coachPlan'

export interface EvolutionEntry {
  id: string
  date: string
  xpGained: number
  note?: string
}

export interface BodyMeasurementEntry {
  id: string
  date: string
  weightKg?: number
  heightCm?: number
  age?: number
  armCm?: number
  thighCm?: number
  waistCm?: number
  chestCm?: number
  beltCm?: number
  hipCm?: number
}

export type NewBodyMeasurementInput = Omit<BodyMeasurementEntry, 'id' | 'date'>

export interface Athlete {
  id: string
  name: string
  sport: string
  team: string
  nationality: string
  photoUrl?: string
  age?: number
  evolutionHistory: EvolutionEntry[]
  weeklyPlan?: WeeklyPlan
  measurements?: BodyMeasurementEntry[]
  assignedCoach?: AssignedCoachPlan
}

export interface NewAthleteInput {
  name: string
  sport: string
  team: string
  nationality: string
  photoUrl?: string
  age?: number
}

export interface NewEvolutionEntryInput {
  xpGained: number
  note?: string
}
