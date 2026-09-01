'use client'

import Link from 'next/link'
import { useAthletes } from '../hooks/useAthletes'
import { useAuth } from '../hooks/useAuth'
import { getLevelProgress, getTotalXp } from '../utils/xp'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function RankingPage() {
  const { athletes } = useAthletes()
  const { currentUser } = useAuth()

  const ranked = athletes
    .map((athlete) => {
      const totalXp = getTotalXp(athlete.evolutionHistory)
      const { level } = getLevelProgress(totalXp)
      return { athlete, totalXp, level }
    })
    .sort((a, b) => b.totalXp - a.totalXp)

  const podium = ranked.slice(0, 3)
  const rest = ranked.slice(3)
  const [first, second, third] = podium

  return (
    <div className="Page">
      <h1 className="Page-title">Ranking geral</h1>

      {ranked.length === 0 ? (
        <p className="Page-empty">Nenhum atleta cadastrado ainda.</p>
      ) : (
        <>
          {podium.length === 3 && (
            <div className="RankingPage-podium">
              <PodiumColumn entry={second} place={2} size="md" />
              <PodiumColumn entry={first} place={1} size="lg" crowned />
              <PodiumColumn entry={third} place={3} size="md" />
            </div>
          )}

          <ol className="RankingPage-list">
            {(podium.length === 3 ? rest : ranked).map(({ athlete, totalXp, level }) => {
              const position = ranked.findIndex((entry) => entry.athlete.id === athlete.id) + 1
              const isMe = currentUser?.athleteId === athlete.id
              return (
                <li key={athlete.id}>
                  <Link className={`RankingPage-row${isMe ? ' me' : ''}`} href={`/athletes/${athlete.id}`}>
                    <span className="RankingPage-rankNum">{position}</span>
                    {athlete.photoUrl ? (
                      <img className="avatar RankingPage-avatarSm RankingPage-avatarImg" src={athlete.photoUrl} alt={athlete.name} />
                    ) : (
                      <span className="avatar RankingPage-avatarSm">{initials(athlete.name)}</span>
                    )}
                    <span className="RankingPage-rowInfo">
                      <span className="RankingPage-rowName">
                        {athlete.name}
                        {isMe && <span className="RankingPage-youTag">VOCÊ</span>}
                      </span>
                      <span className="RankingPage-rowSport">
                        {athlete.sport} · Nível {level}
                      </span>
                    </span>
                    <span className="RankingPage-rowXp">{totalXp.toLocaleString('pt-BR')} XP</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}

interface PodiumColumnProps {
  entry?: { athlete: { id: string; name: string; photoUrl?: string }; totalXp: number }
  place: 1 | 2 | 3
  size: 'md' | 'lg'
  crowned?: boolean
}

function PodiumColumn({ entry, place, size, crowned }: PodiumColumnProps) {
  if (!entry) return <div className="RankingPage-podiumCol" />

  const barHeight = place === 1 ? 88 : place === 2 ? 64 : 48

  return (
    <Link className="RankingPage-podiumCol" href={`/athletes/${entry.athlete.id}`}>
      {crowned && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--lime)" stroke="none" className="RankingPage-crown">
          <path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" />
        </svg>
      )}
      {entry.athlete.photoUrl ? (
        <img
          className={`avatar RankingPage-podiumAvatar RankingPage-podiumAvatar-${size} RankingPage-avatarImg${crowned ? ' crowned' : ''}`}
          src={entry.athlete.photoUrl}
          alt={entry.athlete.name}
        />
      ) : (
        <span className={`avatar RankingPage-podiumAvatar RankingPage-podiumAvatar-${size}${crowned ? ' crowned' : ''}`}>
          {initials(entry.athlete.name)}
        </span>
      )}
      <span className="RankingPage-podiumName">{entry.athlete.name}</span>
      <span className="RankingPage-podiumXp">{entry.totalXp.toLocaleString('pt-BR')} XP</span>
      <span className={`RankingPage-podiumBar${crowned ? ' crowned' : ''}`} style={{ height: barHeight }}>
        {place}
      </span>
    </Link>
  )
}

export default RankingPage
