import type { EvolutionEntry } from '../types/athlete'

const XP_PER_LEVEL = 100

export interface LevelProgress {
  level: number
  currentLevelXp: number
  xpToNextLevel: number
}

export function getTotalXp(evolutionHistory: EvolutionEntry[]): number {
  return evolutionHistory.reduce((total, entry) => total + entry.xpGained, 0)
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const currentLevelXp = totalXp % XP_PER_LEVEL

  return {
    level,
    currentLevelXp,
    xpToNextLevel: XP_PER_LEVEL - currentLevelXp,
  }
}

function toDayKey(dateIso: string): string {
  return new Date(dateIso).toDateString()
}

/** Conta os dias consecutivos (a partir de hoje ou ontem) com pelo menos um registro de XP. */
export function getStreakDays(evolutionHistory: EvolutionEntry[]): number {
  if (evolutionHistory.length === 0) return 0

  const daysWithEntries = new Set(evolutionHistory.map((entry) => toDayKey(entry.date)))
  const cursor = new Date()

  if (!daysWithEntries.has(toDayKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!daysWithEntries.has(toDayKey(cursor.toISOString()))) return 0
  }

  let streak = 0
  while (daysWithEntries.has(toDayKey(cursor.toISOString()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
