import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import type { PublicUser } from '../types/user'

const COOKIE_NAME = 'apex_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30 // 30 dias

function getSecretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET não configurada.')
  return new TextEncoder().encode(secret)
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return typeof payload.userId === 'string' ? payload.userId : null
  } catch {
    return null
  }
}

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

/** Memoizado por requisição — pode ser chamado em vários Server Components/Actions sem repetir a query. */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const userId = await getSessionUserId()
  if (!userId) return null

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return user ? toPublicUser(user) : null
})
