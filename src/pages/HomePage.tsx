import { Link } from 'react-router-dom'
import AthleteCard from '../components/AthleteCard'
import { useAthletes } from '../hooks/useAthletes'
import './HomePage.css'

function HomePage() {
  const { athletes } = useAthletes()

  return (
    <div className="HomePage">
      <Link className="HomePage-newAthleteLink" to="/athletes/new">
        + Cadastrar atleta
      </Link>
      <div className="HomePage-list">
        {athletes.map((athlete) => (
          <Link key={athlete.id} className="HomePage-cardLink" to={`/athletes/${athlete.id}`}>
            <AthleteCard athlete={athlete} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
