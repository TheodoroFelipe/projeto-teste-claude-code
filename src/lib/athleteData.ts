import 'server-only'

import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { athletes, bodyMeasurements, coachAthleteLinks, coachPlans, evolutionEntries, users } from '../db/schema'
import type { Athlete, BodyMeasurementEntry, EvolutionEntry } from '../types/athlete'
import type { AssignedCoachPlan } from '../types/coachPlan'
import type { PublicUser } from '../types/user'

type AthleteRow = typeof athletes.$inferSelect
type EvolutionRow = typeof evolutionEntries.$inferSelect
type MeasurementRow = typeof bodyMeasurements.$inferSelect

function toEvolutionEntry(row: EvolutionRow): EvolutionEntry {
  return { id: row.id, date: row.date.toISOString(), xpGained: row.xpGained, note: row.note ?? undefined }
}

function toMeasurementEntry(row: MeasurementRow): BodyMeasurementEntry {
  return {
    id: row.id,
    date: row.date.toISOString(),
    weightKg: row.weightKg ?? undefined,
    heightCm: row.heightCm ?? undefined,
    age: row.age ?? undefined,
    armCm: row.armCm ?? undefined,
    thighCm: row.thighCm ?? undefined,
    waistCm: row.waistCm ?? undefined,
    chestCm: row.chestCm ?? undefined,
    beltCm: row.beltCm ?? undefined,
    hipCm: row.hipCm ?? undefined,
  }
}

function assignedCoachPlansQuery() {
  return db
    .select({
      athleteId: coachAthleteLinks.athleteId,
      planId: coachPlans.id,
      planName: coachPlans.name,
      weeklyPlan: coachPlans.weeklyPlan,
      coachUserId: coachPlans.coachUserId,
      coachName: users.name,
    })
    .from(coachAthleteLinks)
    .innerJoin(coachPlans, eq(coachAthleteLinks.planId, coachPlans.id))
    .innerJoin(users, eq(coachPlans.coachUserId, users.id))
}

type AssignedCoachPlanRow = Awaited<ReturnType<typeof assignedCoachPlansQuery>>[number]

function toAssignedCoachPlan(row: AssignedCoachPlanRow): AssignedCoachPlan {
  return {
    planId: row.planId,
    planName: row.planName,
    coachUserId: row.coachUserId,
    coachName: row.coachName,
    weeklyPlan: row.weeklyPlan,
  }
}

export function assembleAthlete(
  row: AthleteRow,
  evolutionRows: EvolutionRow[],
  measurementRows: MeasurementRow[],
  assignedCoachRows: AssignedCoachPlanRow[],
): Athlete {
  return {
    id: row.id,
    name: row.name,
    sport: row.sport,
    team: row.team,
    nationality: row.nationality,
    photoUrl: row.photoUrl ?? undefined,
    age: row.age ?? undefined,
    heightCm: row.heightCm ?? undefined,
    weeklyPlan: row.weeklyPlan ?? undefined,
    evolutionHistory: evolutionRows.filter((e) => e.athleteId === row.id).map(toEvolutionEntry),
    measurements: measurementRows.filter((m) => m.athleteId === row.id).map(toMeasurementEntry),
    assignedCoach: (() => {
      const match = assignedCoachRows.find((r) => r.athleteId === row.id)
      return match ? toAssignedCoachPlan(match) : undefined
    })(),
  }
}

export async function getAthleteWithRelations(athleteId: string): Promise<Athlete> {
  const [[row], evolutionRows, measurementRows, assignedCoachRows] = await Promise.all([
    db.select().from(athletes).where(eq(athletes.id, athleteId)).limit(1),
    db.select().from(evolutionEntries).where(eq(evolutionEntries.athleteId, athleteId)).orderBy(asc(evolutionEntries.date)),
    db.select().from(bodyMeasurements).where(eq(bodyMeasurements.athleteId, athleteId)).orderBy(asc(bodyMeasurements.date)),
    assignedCoachPlansQuery().where(eq(coachAthleteLinks.athleteId, athleteId)),
  ])
  if (!row) throw new Error('Atleta não encontrado.')
  return assembleAthlete(row, evolutionRows, measurementRows, assignedCoachRows)
}

/** Ids dos atletas que o usuário pode ver/gerenciar: o próprio e, para treinadores, os vinculados a ele. */
export async function getManagedAthleteIds(user: PublicUser): Promise<string[]> {
  if (user.role !== 'coach') return [user.athleteId]

  const links = await db
    .select({ athleteId: coachAthleteLinks.athleteId })
    .from(coachAthleteLinks)
    .where(eq(coachAthleteLinks.coachUserId, user.id))
  return [user.athleteId, ...links.map((link) => link.athleteId)]
}

export async function canManageAthlete(user: PublicUser, athleteId: string): Promise<boolean> {
  if (user.athleteId === athleteId) return true
  if (user.role !== 'coach') return false

  const [link] = await db
    .select({ id: coachAthleteLinks.id })
    .from(coachAthleteLinks)
    .where(and(eq(coachAthleteLinks.athleteId, athleteId), eq(coachAthleteLinks.coachUserId, user.id)))
    .limit(1)
  return Boolean(link)
}

/** Atletas visíveis ao usuário — nunca a lista completa. */
export async function listAthletesForUser(user: PublicUser | null): Promise<Athlete[]> {
  if (!user) return []

  const ids = await getManagedAthleteIds(user)
  const [athleteRows, evolutionRows, measurementRows, assignedCoachRows] = await Promise.all([
    db.select().from(athletes).where(inArray(athletes.id, ids)).orderBy(asc(athletes.createdAt)),
    db.select().from(evolutionEntries).where(inArray(evolutionEntries.athleteId, ids)).orderBy(asc(evolutionEntries.date)),
    db.select().from(bodyMeasurements).where(inArray(bodyMeasurements.athleteId, ids)).orderBy(asc(bodyMeasurements.date)),
    assignedCoachPlansQuery().where(inArray(coachAthleteLinks.athleteId, ids)),
  ])

  return athleteRows.map((row) => assembleAthlete(row, evolutionRows, measurementRows, assignedCoachRows))
}
