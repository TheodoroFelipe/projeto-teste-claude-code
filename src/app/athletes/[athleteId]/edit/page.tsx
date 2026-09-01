import RequireAuth from '../../../../components/RequireAuth'
import EditAthletePage from '../../../../screens/EditAthletePage'

export default function Page() {
  return (
    <RequireAuth>
      <EditAthletePage />
    </RequireAuth>
  )
}
