import { useAuth } from './useAuth'

export function useCanManageAthlete(athleteId: string | undefined): boolean {
  const { currentUser } = useAuth()
  if (!currentUser || !athleteId) return false
  return currentUser.role === 'coach' || currentUser.athleteId === athleteId
}
