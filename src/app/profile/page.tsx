import RequireAuth from '../../components/RequireAuth'
import UserProfilePage from '../../screens/UserProfilePage'

export default function Page() {
  return (
    <RequireAuth>
      <UserProfilePage />
    </RequireAuth>
  )
}
