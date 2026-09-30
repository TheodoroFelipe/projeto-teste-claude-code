'use client'

import { useAuth } from '../hooks/useAuth'
import type { RankingEntry } from '../types/ranking'

interface RankingPageProps {
  entries: RankingEntry[]
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function RankingPage({ entries: ranked }: RankingPageProps) {
  const { currentUser } = useAuth()

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
            {(podium.length === 3 ? rest : ranked).map((entry) => {
              const { athleteId, name, photoUrl, totalXp, level } = entry
              const position = ranked.findIndex((item) => item.athleteId === athleteId) + 1
              const isMe = currentUser?.athleteId === athleteId
              return (
                <li key={athleteId}>
                  <div className={`RankingPage-row${isMe ? ' me' : ''}`}>
                    <span className="RankingPage-rankNum">{position}</span>
                    {photoUrl ? (
                      <img className="avatar RankingPage-avatarSm RankingPage-avatarImg" src={photoUrl} alt={name} />
                    ) : (
                      <span className="avatar RankingPage-avatarSm">{initials(name)}</span>
                    )}
                    <span className="RankingPage-rowInfo">
                      <span className="RankingPage-rowName">
                        {name}
                        {isMe && <span className="RankingPage-youTag">VOCÊ</span>}
                      </span>
                      <span className="RankingPage-rowSport">Nível {level}</span>
                    </span>
                    <span className="RankingPage-rowXp">{totalXp.toLocaleString('pt-BR')} XP</span>
                  </div>
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
  entry?: RankingEntry
  place: 1 | 2 | 3
  size: 'md' | 'lg'
  crowned?: boolean
}

function PodiumColumn({ entry, place, size, crowned }: PodiumColumnProps) {
  if (!entry) return <div className="RankingPage-podiumCol" />

  const barHeight = place === 1 ? 88 : place === 2 ? 64 : 48

  return (
    <div className="RankingPage-podiumCol">
      {crowned && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--lime)" stroke="none" className="RankingPage-crown">
          <path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" />
        </svg>
      )}
      {entry.photoUrl ? (
        <img
          className={`avatar RankingPage-podiumAvatar RankingPage-podiumAvatar-${size} RankingPage-avatarImg${crowned ? ' crowned' : ''}`}
          src={entry.photoUrl}
          alt={entry.name}
        />
      ) : (
        <span className={`avatar RankingPage-podiumAvatar RankingPage-podiumAvatar-${size}${crowned ? ' crowned' : ''}`}>
          {initials(entry.name)}
        </span>
      )}
      <span className="RankingPage-podiumName">{entry.name}</span>
      <span className="RankingPage-podiumXp">{entry.totalXp.toLocaleString('pt-BR')} XP</span>
      <span className={`RankingPage-podiumBar${crowned ? ' crowned' : ''}`} style={{ height: barHeight }}>
        {place}
      </span>
    </div>
  )
}

export default RankingPage
