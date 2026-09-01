import RequireAuth from '../../../components/RequireAuth'
import AthleteProfilePage from '../../../screens/AthleteProfilePage'

export default function Page() {
  return (
    <RequireAuth>
      <AthleteProfilePage />
    </RequireAuth>
  )
}
