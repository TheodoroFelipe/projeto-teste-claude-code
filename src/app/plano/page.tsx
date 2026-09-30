import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/session'
import PlansPage from '../../screens/PlansPage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <PlansPage />
}
