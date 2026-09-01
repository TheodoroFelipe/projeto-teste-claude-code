import { redirect } from 'next/navigation'
import { getCurrentUser } from '../lib/session'
import HomePage from '../screens/HomePage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <HomePage />
}
