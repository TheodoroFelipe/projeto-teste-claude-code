'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { hashPassword, verifyPassword } from '../../lib/password'
import { clearSession, createSession, getCurrentUser } from '../../lib/session'
import { isValidEmail, MIN_PASSWORD_LENGTH } from '../../utils/validation'
import type { LoginInput, NewUserInput, PublicUser } from '../../types/user'

export type AuthActionResult = { ok: true; user: PublicUser } | { ok: false; error: string }

function toPublicUser(user: typeof users.$inferSelect): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    athleteId: user.athleteId,
    role: user.role,
  }
}

export async function registerAction(input: NewUserInput): Promise<AuthActionResult> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()

  if (!name) return { ok: false, error: 'Nome é obrigatório.' }
  if (!isValidEmail(email)) return { ok: false, error: 'E-mail inválido.' }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` }
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: 'As senhas não coincidem.' }
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) return { ok: false, error: 'Este e-mail já está cadastrado.' }

  const passwordHash = await hashPassword(input.password)
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash, athleteId: input.athleteId, role: input.role })
    .returning()

  await createSession(created.id)
  return { ok: true, user: toPublicUser(created) }
}

export async function loginAction(input: LoginInput): Promise<AuthActionResult> {
  const email = input.email.trim().toLowerCase()
  const invalidCredentialsError: AuthActionResult = { ok: false, error: 'E-mail ou senha inválidos.' }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) return invalidCredentialsError

  const passwordOk = await verifyPassword(input.password, user.passwordHash)
  if (!passwordOk) return invalidCredentialsError

  await createSession(user.id)
  return { ok: true, user: toPublicUser(user) }
}

export async function logoutAction(): Promise<void> {
  await clearSession()
}

export async function updateNameAction(name: string): Promise<AuthActionResult> {
  const currentUser = await getCurrentUser()
  const trimmedName = name.trim()
  if (!currentUser) return { ok: false, error: 'Nenhum usuário autenticado.' }
  if (!trimmedName) return { ok: false, error: 'Nome é obrigatório.' }

  const [updated] = await db
    .update(users)
    .set({ name: trimmedName })
    .where(eq(users.id, currentUser.id))
    .returning()

  return { ok: true, user: toPublicUser(updated) }
}

export async function isEmailTakenAction(email: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1)
  return Boolean(existing)
}
