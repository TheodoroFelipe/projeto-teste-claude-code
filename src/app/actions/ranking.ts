'use server'

import { eq, sql } from 'drizzle-orm'
import { db } from '../../db'
import { athletes, evolutionEntries } from '../../db/schema'
import { getCurrentUser } from '../../lib/session'
import { isPro } from '../../utils/plan'
import { getLevelProgress } from '../../utils/xp'
import type { RankingEntry } from '../../types/ranking'

export type RankingActionResult = { ok: true; entries: RankingEntry[] } | { ok: false; reason: 'unauthenticated' | 'pro-required' }

/** Ranking geral — recurso Pro. Só expõe nome, foto, XP total e nível. */
export async function getRankingAction(): Promise<RankingActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, reason: 'unauthenticated' }
  if (!isPro(user)) return { ok: false, reason: 'pro-required' }

  const rows = await db
    .select({
      athleteId: athletes.id,
      name: athletes.name,
      photoUrl: athletes.photoUrl,
      totalXp: sql<number>`coalesce(sum(${evolutionEntries.xpGained}), 0)::int`,
    })
    .from(athletes)
    .leftJoin(evolutionEntries, eq(evolutionEntries.athleteId, athletes.id))
    .groupBy(athletes.id)

  const entries = rows
    .map((row) => ({
      athleteId: row.athleteId,
      name: row.name,
      photoUrl: row.photoUrl ?? undefined,
      totalXp: row.totalXp,
      level: getLevelProgress(row.totalXp).level,
    }))
    .sort((a, b) => b.totalXp - a.totalXp)

  return { ok: true, entries }
}
