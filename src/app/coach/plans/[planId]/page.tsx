import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/session'
import { getCoachPlanAction, listInvitesForPlanAction } from '../../../actions/coachPlans'
import CoachPlanEditorPage from '../../../../screens/CoachPlanEditorPage'

export default async function Page({ params }: { params: Promise<{ planId: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'coach') redirect('/')

  const { planId } = await params
  const [plan, invites] = await Promise.all([getCoachPlanAction(planId), listInvitesForPlanAction(planId)])

  return <CoachPlanEditorPage plan={plan} initialInvites={invites} />
}
