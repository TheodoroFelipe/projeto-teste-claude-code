import type { WeeklyPlan } from './trainingPlan'

export interface EvolutionEntry {
  id: string
  date: string
  xpGained: number
  note?: string
}

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
