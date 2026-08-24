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
