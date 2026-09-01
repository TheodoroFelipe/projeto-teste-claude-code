import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/session'
import BodyMeasurementsPage from '../../../../screens/BodyMeasurementsPage'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <BodyMeasurementsPage />
}
