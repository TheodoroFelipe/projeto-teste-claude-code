import type { PlannedExercise } from '../types/trainingPlan'

export function calcPlannedExerciseXp(exercise: PlannedExercise): number {
  switch (exercise.modality) {
    case 'musculacao':
      return Math.round(exercise.targetLoadKg * exercise.targetReps * 0.08)
    case 'corrida':
    case 'ciclismo':
      return Math.round(exercise.targetDistanceKm * 8)
    case 'natacao':
      return Math.round(exercise.targetDistanceMeters * 0.032)
    case 'outro':
      return Math.round(exercise.targetDurationMin * 2)
  }
}
