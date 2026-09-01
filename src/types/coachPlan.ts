import type { WeeklyPlan } from './trainingPlan'

export interface CoachPlan {
  id: string
  name: string
  weeklyPlan: WeeklyPlan
  createdAt: string
}

export interface PlanInvite {
  id: string
  planId: string
  planName: string
  coachName: string
  athleteEmail: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface AssignedCoachPlan {
  planId: string
  planName: string
  coachUserId: string
  coachName: string
  weeklyPlan: WeeklyPlan
}
