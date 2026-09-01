import RequireAuth from '../../components/RequireAuth'
import TodayWorkoutPage from '../../screens/TodayWorkoutPage'

export default function Page() {
  return (
    <RequireAuth>
      <TodayWorkoutPage />
    </RequireAuth>
  )
}
