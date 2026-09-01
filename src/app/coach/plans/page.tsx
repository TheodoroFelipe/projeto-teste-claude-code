import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/session'
import { listCoachPlansAction } from '../../actions/coachPlans'
import CoachPlansPage from '../../../screens/CoachPlansPage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'coach') redirect('/')

  const plans = await listCoachPlansAction()

  return <CoachPlansPage initialPlans={plans} />
}
