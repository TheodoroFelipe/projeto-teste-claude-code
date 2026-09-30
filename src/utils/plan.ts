import type { PublicUser } from '../types/user'

/** Única fonte de verdade para "este usuário tem acesso Pro?" — usada no cliente e no servidor. */
export function isPro(user: Pick<PublicUser, 'plan' | 'proUntil'> | null | undefined): boolean {
  if (!user || user.plan !== 'pro') return false
  return user.proUntil === null || new Date(user.proUntil).getTime() > Date.now()
}
