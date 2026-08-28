export type Modality = 'musculacao' | 'corrida' | 'ciclismo' | 'natacao' | 'outro'

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

interface PlannedExerciseBase {
  id: string
  name: string
}

export interface StrengthExercise extends PlannedExerciseBase {
  modality: 'musculacao'
  targetSets: number
  targetReps: number
  targetLoadKg: number
}

export interface DistanceExercise extends PlannedExerciseBase {
  modality: 'corrida' | 'ciclismo'
  targetDistanceKm: number
  targetDurationMin: number
}

export interface SwimExercise extends PlannedExerciseBase {
  modality: 'natacao'
  targetDistanceMeters: number
  targetDurationMin: number
}

export interface OtherExercise extends PlannedExerciseBase {
  modality: 'outro'
  targetDurationMin: number
  notes?: string
}

export type PlannedExercise = StrengthExercise | DistanceExercise | SwimExercise | OtherExercise

export interface DayPlan {
  day: WeekDay
  exercises: PlannedExercise[]
}

export type WeeklyPlan = DayPlan[]
