import './AthleteCard.css'
import type { Athlete } from '../types/athlete'

interface AthleteCardProps {
  athlete: Athlete
}

function AthleteCard({ athlete }: AthleteCardProps) {
  const { name, sport, team, nationality, photoUrl, age } = athlete
  return (
    <div className="AthleteCard">
      {photoUrl && <img className="AthleteCard-photo" src={photoUrl} alt={name} />}
      <div className="AthleteCard-info">
        <h2 className="AthleteCard-name">{name}</h2>
        <p className="AthleteCard-sport">{sport}</p>
        <ul className="AthleteCard-details">
          <li>Time: {team}</li>
          <li>Nacionalidade: {nationality}</li>
          {age !== undefined && <li>Idade: {age}</li>}
        </ul>
      </div>
    </div>
  )
}

export default AthleteCard
