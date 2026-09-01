import RequireAuth from '../../../../components/RequireAuth'
import TrainingPlanPage from '../../../../screens/TrainingPlanPage'

export default function Page() {
  return (
    <RequireAuth>
      <TrainingPlanPage />
    </RequireAuth>
  )
}
