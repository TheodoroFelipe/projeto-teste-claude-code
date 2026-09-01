import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/session'
import RankingPage from '../../screens/RankingPage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <RankingPage />
}
