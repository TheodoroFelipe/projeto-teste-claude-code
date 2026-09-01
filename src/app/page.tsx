import RequireAuth from '../components/RequireAuth'
import HomePage from '../screens/HomePage'

export default function Page() {
  return (
    <RequireAuth>
      <HomePage />
    </RequireAuth>
  )
}
