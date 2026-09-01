import RequireAuth from '../../components/RequireAuth'
import RankingPage from '../../screens/RankingPage'

export default function Page() {
  return (
    <RequireAuth>
      <RankingPage />
    </RequireAuth>
  )
}
