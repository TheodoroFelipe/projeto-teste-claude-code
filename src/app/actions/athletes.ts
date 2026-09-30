'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { athletes, bodyMeasurements, evolutionEntries } from '../../db/schema'
import { assembleAthlete, canManageAthlete, getAthleteWithRelations, listAthletesForUser } from '../../lib/athleteData'
import { getCurrentUser } from '../../lib/session'
import type {
  Athlete,
  NewAthleteInput,
  NewBodyMeasurementInput,
  NewEvolutionEntryInput,
} from '../../types/athlete'

async function requireManagedAthlete(athleteId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user || !(await canManageAthlete(user, athleteId))) {
    throw new Error('Você não tem permissão para gerenciar este atleta.')
  }
}

export async function listAthletesAction(): Promise<Athlete[]> {
  return listAthletesForUser(await getCurrentUser())
}

export async function addAthleteAction(input: NewAthleteInput): Promise<Athlete> {
  // Sem sessão = auto-cadastro do atleta; treinador logado passa a ser o dono do registro.
  const user = await getCurrentUser()
  const createdByUserId = user?.role === 'coach' ? user.id : null
  const [created] = await db
    .insert(athletes)
    .values({
      name: input.name,
      sport: input.sport,
      team: input.team,
      nationality: input.nationality,
      photoUrl: input.photoUrl ?? null,
      age: input.age ?? null,
      heightCm: input.heightCm ?? null,
      createdByUserId,
    })
    .returning()

  return assembleAthlete(created, [], [], [])
}

export async function updateAthleteAction(athleteId: string, input: NewAthleteInput): Promise<Athlete> {
  await requireManagedAthlete(athleteId)
  await db
    .update(athletes)
    .set({
      name: input.name,
      sport: input.sport,
      team: input.team,
      nationality: input.nationality,
      photoUrl: input.photoUrl ?? null,
      age: input.age ?? null,
      heightCm: input.heightCm ?? null,
    })
    .where(eq(athletes.id, athleteId))

  return getAthleteWithRelations(athleteId)
}

export async function addEvolutionEntryAction(athleteId: string, input: NewEvolutionEntryInput): Promise<Athlete> {
  await requireManagedAthlete(athleteId)
  await db.insert(evolutionEntries).values({ athleteId, xpGained: input.xpGained, note: input.note ?? null })
  return getAthleteWithRelations(athleteId)
}

export async function updateWeeklyPlanAction(athleteId: string, weeklyPlan: Athlete['weeklyPlan']): Promise<Athlete> {
  await requireManagedAthlete(athleteId)
  await db
    .update(athletes)
    .set({ weeklyPlan: weeklyPlan ?? null })
    .where(eq(athletes.id, athleteId))

  return getAthleteWithRelations(athleteId)
}

export async function addMeasurementEntryAction(athleteId: string, input: NewBodyMeasurementInput): Promise<Athlete> {
  await requireManagedAthlete(athleteId)
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
