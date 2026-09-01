import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/session'
import NewAthletePage from '../../../screens/NewAthletePage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <NewAthletePage />
}
