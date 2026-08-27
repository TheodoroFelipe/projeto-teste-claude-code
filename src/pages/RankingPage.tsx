import { Link } from 'react-router-dom'
import { useAthletes } from '../hooks/useAthletes'
import { getLevelProgress, getTotalXp } from '../utils/xp'
import './RankingPage.css'

function RankingPage() {
  const { athletes } = useAthletes()

  const ranked = athletes
    .map((athlete) => {
      const totalXp = getTotalXp(athlete.evolutionHistory)
      const { level } = getLevelProgress(totalXp)
      return { athlete, totalXp, level }
    })
    .sort((a, b) => b.totalXp - a.totalXp)

  return (
    <div className="RankingPage">
      <Link className="RankingPage-backLink" to="/">
        &larr; Voltar para a lista
      </Link>
      <h2>Ranking por XP</h2>

      {ranked.length === 0 ? (
        <p>Nenhum atleta cadastrado ainda.</p>
      ) : (
        <ol className="RankingPage-list">
          {ranked.map(({ athlete, totalXp, level }, index) => (
            <li key={athlete.id} className="RankingPage-item">
              <Link className="RankingPage-itemLink" to={`/athletes/${athlete.id}`}>
                <span className="RankingPage-position">{index + 1}º</span>
                <span className="RankingPage-name">{athlete.name}</span>
                <span className="RankingPage-sport">{athlete.sport}</span>
                <span className="RankingPage-level">Nível {level}</span>
                <span className="RankingPage-xp">{totalXp} XP</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default RankingPage
