import RequireAuth from '../../../../components/RequireAuth'
import BodyMeasurementsPage from '../../../../screens/BodyMeasurementsPage'

export default function Page() {
  return (
    <RequireAuth>
      <BodyMeasurementsPage />
    </RequireAuth>
  )
}
