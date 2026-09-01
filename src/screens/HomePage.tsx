'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AthleteCard from '../components/AthleteCard'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'

function HomePage() {
  const { currentUser } = useAuth()
  const { athletes } = useAthletes()
  const router = useRouter()
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

  const shouldRedirectToOwnProfile = Boolean(currentUser && currentUser.role !== 'coach')

  useEffect(() => {
    if (currentUser && currentUser.role !== 'coach') {
      router.replace(`/athletes/${currentUser.athleteId}`)
    }
  }, [currentUser, router])

  if (shouldRedirectToOwnProfile) return null

  return (
    <div className="Page Page-wide">
      <div className="HomePage-header">
        <h1 className="Page-title">Atletas</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="btn-secondary" href="/coach/plans">
            Meus planos de treino
          </Link>
          <Link className="btn-secondary" href="/athletes/new">
            + Cadastrar atleta
          </Link>
        </div>
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
          <Link key={athlete.id} className="HomePage-cardLink" href={`/athletes/${athlete.id}`}>
            <AthleteCard athlete={athlete} />
          </Link>
        ))}
        {filteredAthletes.length === 0 && <p className="Page-empty">Nenhum atleta encontrado.</p>}
      </div>
    </div>
  )
}

export default HomePage
