import type { Athlete } from '../types/athlete'

interface AthleteCardProps {
  athlete: Athlete
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function AthleteCard({ athlete }: AthleteCardProps) {
  const { name, sport, team, nationality, photoUrl, age, heightCm } = athlete
  return (
    <div className="AthleteCard">
      {photoUrl ? (
        <img className="AthleteCard-photo" src={photoUrl} alt={name} />
      ) : (
        <span className="avatar AthleteCard-photo">{initials(name)}</span>
      )}
      <div className="AthleteCard-info">
        <h2 className="AthleteCard-name">{name}</h2>
        <p className="AthleteCard-sport">{sport}</p>
        <ul className="AthleteCard-details">
          {team && <li>Time: {team}</li>}
          <li>Nacionalidade: {nationality}</li>
          {age !== undefined && <li>Idade: {age}</li>}
          {heightCm !== undefined && <li>Altura: {heightCm} cm</li>}
        </ul>
      </div>
    </div>
  )
}

export default AthleteCard
