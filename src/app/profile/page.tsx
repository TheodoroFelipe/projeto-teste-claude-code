import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/session'
import UserProfilePage from '../../screens/UserProfilePage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <UserProfilePage />
}
