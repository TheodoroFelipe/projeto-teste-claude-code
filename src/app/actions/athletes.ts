'use server'

import { asc, eq } from 'drizzle-orm'
import { db } from '../../db'
import { athletes, bodyMeasurements, coachAthleteLinks, coachPlans, evolutionEntries, users } from '../../db/schema'
import type {
  Athlete,
  BodyMeasurementEntry,
  EvolutionEntry,
  NewAthleteInput,
  NewBodyMeasurementInput,
  NewEvolutionEntryInput,
} from '../../types/athlete'
import type { AssignedCoachPlan } from '../../types/coachPlan'

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

function assembleAthlete(
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

export async function listAthletesAction(): Promise<Athlete[]> {
  const [athleteRows, evolutionRows, measurementRows, assignedCoachRows] = await Promise.all([
    db.select().from(athletes).orderBy(asc(athletes.createdAt)),
    db.select().from(evolutionEntries).orderBy(asc(evolutionEntries.date)),
    db.select().from(bodyMeasurements).orderBy(asc(bodyMeasurements.date)),
    assignedCoachPlansQuery(),
  ])

  return athleteRows.map((row) => assembleAthlete(row, evolutionRows, measurementRows, assignedCoachRows))
}

export async function addAthleteAction(input: NewAthleteInput): Promise<Athlete> {
  const [created] = await db
    .insert(athletes)
    .values({
      name: input.name,
      sport: input.sport,
      team: input.team,
      nationality: input.nationality,
      photoUrl: input.photoUrl ?? null,
      age: input.age ?? null,
    })
    .returning()

  return assembleAthlete(created, [], [], [])
}

export async function updateAthleteAction(athleteId: string, input: NewAthleteInput): Promise<Athlete> {
  await db
    .update(athletes)
    .set({
      name: input.name,
      sport: input.sport,
      team: input.team,
      nationality: input.nationality,
      photoUrl: input.photoUrl ?? null,
      age: input.age ?? null,
    })
    .where(eq(athletes.id, athleteId))

  return getAthleteWithRelations(athleteId)
}

export async function addEvolutionEntryAction(athleteId: string, input: NewEvolutionEntryInput): Promise<Athlete> {
  await db.insert(evolutionEntries).values({ athleteId, xpGained: input.xpGained, note: input.note ?? null })
  return getAthleteWithRelations(athleteId)
}

export async function updateWeeklyPlanAction(athleteId: string, weeklyPlan: Athlete['weeklyPlan']): Promise<Athlete> {
  await db
    .update(athletes)
    .set({ weeklyPlan: weeklyPlan ?? null })
    .where(eq(athletes.id, athleteId))

  return getAthleteWithRelations(athleteId)
}

export async function addMeasurementEntryAction(athleteId: string, input: NewBodyMeasurementInput): Promise<Athlete> {
  await db.insert(bodyMeasurements).values({
    athleteId,
    weightKg: input.weightKg ?? null,
    heightCm: input.heightCm ?? null,
    age: input.age ?? null,
    armCm: input.armCm ?? null,
    thighCm: input.thighCm ?? null,
    waistCm: input.waistCm ?? null,
    chestCm: input.chestCm ?? null,
    beltCm: input.beltCm ?? null,
    hipCm: input.hipCm ?? null,
  })
  return getAthleteWithRelations(athleteId)
}
