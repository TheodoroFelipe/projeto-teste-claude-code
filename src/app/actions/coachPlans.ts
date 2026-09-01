'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { coachAthleteLinks, coachPlans, planInvites, users } from '../../db/schema'
import { getCurrentUser } from '../../lib/session'
import { createEmptyWeeklyPlan } from '../../utils/trainingPlan'
import { getAthleteWithRelations } from './athletes'
import type { Athlete } from '../../types/athlete'
import type { CoachPlan, PlanInvite } from '../../types/coachPlan'
import type { WeeklyPlan } from '../../types/trainingPlan'

type CoachPlanRow = typeof coachPlans.$inferSelect

function toCoachPlan(row: CoachPlanRow): CoachPlan {
  return { id: row.id, name: row.name, weeklyPlan: row.weeklyPlan, createdAt: row.createdAt.toISOString() }
}

async function requireCoach() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'coach') throw new Error('Apenas treinadores podem gerenciar planos.')
  return user
}

async function requireOwnedPlan(planId: string, coachUserId: string): Promise<CoachPlanRow> {
  const [plan] = await db
    .select()
    .from(coachPlans)
    .where(and(eq(coachPlans.id, planId), eq(coachPlans.coachUserId, coachUserId)))
    .limit(1)
  if (!plan) throw new Error('Plano não encontrado.')
  return plan
}

export async function listCoachPlansAction(): Promise<CoachPlan[]> {
  const coach = await requireCoach()
  const rows = await db.select().from(coachPlans).where(eq(coachPlans.coachUserId, coach.id))
  return rows.map(toCoachPlan)
}

export async function getCoachPlanAction(planId: string): Promise<CoachPlan> {
  const coach = await requireCoach()
  const plan = await requireOwnedPlan(planId, coach.id)
  return toCoachPlan(plan)
}

export async function createCoachPlanAction(name: string): Promise<CoachPlan> {
  const coach = await requireCoach()
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('Nome do plano é obrigatório.')

  const [created] = await db
    .insert(coachPlans)
    .values({ coachUserId: coach.id, name: trimmedName, weeklyPlan: createEmptyWeeklyPlan() })
    .returning()

  return toCoachPlan(created)
}

export async function updateCoachPlanWeeklyPlanAction(planId: string, weeklyPlan: WeeklyPlan): Promise<CoachPlan> {
  const coach = await requireCoach()
  await requireOwnedPlan(planId, coach.id)

  const [updated] = await db.update(coachPlans).set({ weeklyPlan }).where(eq(coachPlans.id, planId)).returning()
  return toCoachPlan(updated)
}

export type SendInviteResult = { ok: true; athleteName: string } | { ok: false; error: string }

export async function sendPlanInviteAction(planId: string, athleteEmail: string): Promise<SendInviteResult> {
  const coach = await requireCoach()
  await requireOwnedPlan(planId, coach.id)

  const email = athleteEmail.trim().toLowerCase()
  const [athleteUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!athleteUser || athleteUser.role !== 'athlete') {
    return { ok: false, error: 'Nenhum atleta cadastrado foi encontrado com esse e-mail.' }
  }

  const [existing] = await db
    .select({ id: planInvites.id })
    .from(planInvites)
    .where(and(eq(planInvites.planId, planId), eq(planInvites.athleteEmail, email), eq(planInvites.status, 'pending')))
    .limit(1)

  if (!existing) {
    await db.insert(planInvites).values({ planId, athleteEmail: email, status: 'pending' })
  }

  return { ok: true, athleteName: athleteUser.name }
}

export async function listInvitesForPlanAction(planId: string): Promise<PlanInvite[]> {
  const coach = await requireCoach()
  const plan = await requireOwnedPlan(planId, coach.id)

  const rows = await db.select().from(planInvites).where(eq(planInvites.planId, planId))
  return rows.map((row) => ({
    id: row.id,
    planId: row.planId,
    planName: plan.name,
    coachName: coach.name,
    athleteEmail: row.athleteEmail,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function listPendingInvitesForCurrentUserAction(): Promise<PlanInvite[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const rows = await db
    .select({
      id: planInvites.id,
      planId: planInvites.planId,
      athleteEmail: planInvites.athleteEmail,
      status: planInvites.status,
      createdAt: planInvites.createdAt,
      planName: coachPlans.name,
      coachName: users.name,
    })
    .from(planInvites)
    .innerJoin(coachPlans, eq(planInvites.planId, coachPlans.id))
    .innerJoin(users, eq(coachPlans.coachUserId, users.id))
    .where(and(eq(planInvites.athleteEmail, user.email.toLowerCase()), eq(planInvites.status, 'pending')))

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
}

export type RespondInviteResult = { ok: true; athlete?: Athlete } | { ok: false; error: string }

export async function acceptPlanInviteAction(inviteId: string): Promise<RespondInviteResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Nenhum usuário autenticado.' }

  const [invite] = await db.select().from(planInvites).where(eq(planInvites.id, inviteId)).limit(1)
  if (!invite || invite.athleteEmail !== user.email.toLowerCase() || invite.status !== 'pending') {
    return { ok: false, error: 'Convite não encontrado ou já respondido.' }
  }

  const [plan] = await db.select().from(coachPlans).where(eq(coachPlans.id, invite.planId)).limit(1)
  if (!plan) return { ok: false, error: 'Plano do treinador não encontrado.' }

  await db.update(planInvites).set({ status: 'accepted' }).where(eq(planInvites.id, inviteId))
  await db
    .insert(coachAthleteLinks)
    .values({ coachUserId: plan.coachUserId, athleteId: user.athleteId, planId: plan.id })
    .onConflictDoUpdate({
      target: coachAthleteLinks.athleteId,
      set: { coachUserId: plan.coachUserId, planId: plan.id },
    })

  const athlete = await getAthleteWithRelations(user.athleteId)
  return { ok: true, athlete }
}

export async function declinePlanInviteAction(inviteId: string): Promise<RespondInviteResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Nenhum usuário autenticado.' }

  const [invite] = await db.select().from(planInvites).where(eq(planInvites.id, inviteId)).limit(1)
  if (!invite || invite.athleteEmail !== user.email.toLowerCase() || invite.status !== 'pending') {
    return { ok: false, error: 'Convite não encontrado ou já respondido.' }
  }

  await db.update(planInvites).set({ status: 'declined' }).where(eq(planInvites.id, inviteId))
  return { ok: true }
}
