import RequireAuth from '../../../../components/RequireAuth'
import TrainingSessionPage from '../../../../screens/TrainingSessionPage'

export default function Page() {
  return (
    <RequireAuth>
      <TrainingSessionPage />
    </RequireAuth>
  )
}
