import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/session'
import { getRankingAction } from '../actions/ranking'
import RankingPage from '../../screens/RankingPage'
import ProGate from '../../components/ProGate'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const result = await getRankingAction()
  if (!result.ok) {
    return (
      <div className="Page">
        <h1 className="Page-title">Ranking geral</h1>
        <ProGate
          title="Veja o ranking de todos os atletas"
          description="Compare seu XP e seu nível com os demais usuários do app. Recurso exclusivo do plano Pro."
        />
      </div>
    )
  }

  return <RankingPage entries={result.entries} />
}
