import { useAuth } from './useAuth'
import { useAthletes } from './useAthletes'

export function useCanManageAthlete(athleteId: string | undefined): boolean {
  const { currentUser } = useAuth()
  const { getAthleteById } = useAthletes()
  if (!currentUser || !athleteId) return false
  if (currentUser.athleteId === athleteId) return true
  if (currentUser.role !== 'coach') return false

  const athlete = getAthleteById(athleteId)
  return athlete?.assignedCoach?.coachUserId === currentUser.id
}
