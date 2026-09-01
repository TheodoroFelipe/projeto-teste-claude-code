import RequireAuth from '../../../components/RequireAuth'
import NewAthletePage from '../../../screens/NewAthletePage'

export default function Page() {
  return (
    <RequireAuth>
      <NewAthletePage />
    </RequireAuth>
  )
}
