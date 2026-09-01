import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/session'
import TrainingPlanPage from '../../../../screens/TrainingPlanPage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <TrainingPlanPage />
}
