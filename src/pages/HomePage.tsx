import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AthleteCard from '../components/AthleteCard'
import { useAthletes } from '../hooks/useAthletes'
import './HomePage.css'

function HomePage() {
  const { athletes } = useAthletes()
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('')

  const sports = useMemo(
    () => Array.from(new Set(athletes.map((athlete) => athlete.sport))).sort(),
    [athletes],
  )

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchesSport = sportFilter ? athlete.sport === sportFilter : true
    return matchesSearch && matchesSport
  })

  return (
    <div className="HomePage">
      <div className="HomePage-actions">
        <Link className="HomePage-newAthleteLink" to="/athletes/new">
          + Cadastrar atleta
        </Link>
        <Link className="HomePage-rankingLink" to="/ranking">
          Ver ranking por XP &rarr;
        </Link>
      </div>

      <div className="HomePage-filters">
        <input
          type="text"
          className="HomePage-searchInput"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="HomePage-sportSelect"
          value={sportFilter}
          onChange={(event) => setSportFilter(event.target.value)}
        >
          <option value="">Todos os esportes</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      <div className="HomePage-list">
        {filteredAthletes.map((athlete) => (
          <Link key={athlete.id} className="HomePage-cardLink" to={`/athletes/${athlete.id}`}>
            <AthleteCard athlete={athlete} />
          </Link>
        ))}
        {filteredAthletes.length === 0 && <p className="HomePage-empty">Nenhum atleta encontrado.</p>}
      </div>
    </div>
  )
}

export default HomePage
