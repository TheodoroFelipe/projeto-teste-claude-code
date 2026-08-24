import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Athlete, NewAthleteInput } from '../types/athlete'
import './AthleteForm.css'

interface AthleteFormProps {
  initialValues?: Athlete
  submitLabel: string
  onSubmit: (input: NewAthleteInput) => void
}

function AthleteForm({ initialValues, submitLabel, onSubmit }: AthleteFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [sport, setSport] = useState(initialValues?.sport ?? '')
  const [team, setTeam] = useState(initialValues?.team ?? '')
  const [nationality, setNationality] = useState(initialValues?.nationality ?? '')
  const [photoUrl, setPhotoUrl] = useState(initialValues?.photoUrl ?? '')
  const [age, setAge] = useState(initialValues?.age !== undefined ? String(initialValues.age) : '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      name: name.trim(),
      sport: sport.trim(),
      team: team.trim(),
      nationality: nationality.trim(),
      photoUrl: photoUrl.trim() || undefined,
      age: age.trim() ? Number(age) : undefined,
    })
  }

  return (
    <form className="AthleteForm" onSubmit={handleSubmit}>
      <label htmlFor="athlete-name">Nome</label>
      <input id="athlete-name" type="text" required value={name} onChange={(event) => setName(event.target.value)} />

      <label htmlFor="athlete-sport">Esporte</label>
      <input
        id="athlete-sport"
        type="text"
        required
        value={sport}
        onChange={(event) => setSport(event.target.value)}
      />

      <label htmlFor="athlete-team">Time</label>
      <input id="athlete-team" type="text" required value={team} onChange={(event) => setTeam(event.target.value)} />

      <label htmlFor="athlete-nationality">Nacionalidade</label>
      <input
        id="athlete-nationality"
        type="text"
        required
        value={nationality}
        onChange={(event) => setNationality(event.target.value)}
      />

      <label htmlFor="athlete-photo">URL da foto</label>
      <input
        id="athlete-photo"
        type="url"
        value={photoUrl}
        onChange={(event) => setPhotoUrl(event.target.value)}
      />

      <label htmlFor="athlete-age">Idade</label>
      <input id="athlete-age" type="number" min={0} value={age} onChange={(event) => setAge(event.target.value)} />

      <button type="submit">{submitLabel}</button>
    </form>
  )
}

export default AthleteForm
