'use client'

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Athlete, NewAthleteInput } from '../types/athlete'
import { readFileAsDataUrl } from '../utils/file'

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
  const [photoError, setPhotoError] = useState<string | null>(null)

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setPhotoError(null)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPhotoUrl(dataUrl)
    } catch {
      setPhotoError('Não foi possível carregar a imagem.')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      name: name.trim(),
      sport: sport.trim(),
      team: team.trim(),
      nationality: nationality.trim(),
      photoUrl: photoUrl || undefined,
      age: age.trim() ? Number(age) : undefined,
    })
  }

  return (
    <form className="AthleteForm card" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="athlete-name">Nome</label>
        <input id="athlete-name" type="text" required value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <div className="field-group">
        <label htmlFor="athlete-sport">Esporte</label>
        <input
          id="athlete-sport"
          type="text"
          required
          value={sport}
          onChange={(event) => setSport(event.target.value)}
        />
      </div>

      <div className="field-group">
        <label htmlFor="athlete-team">Time (opcional)</label>
        <input id="athlete-team" type="text" value={team} onChange={(event) => setTeam(event.target.value)} />
      </div>

      <div className="field-group">
        <label htmlFor="athlete-nationality">Nacionalidade</label>
        <input
          id="athlete-nationality"
          type="text"
          required
          value={nationality}
          onChange={(event) => setNationality(event.target.value)}
        />
      </div>

      <div className="field-group">
        <label htmlFor="athlete-photo">Foto</label>
        {photoUrl && <img className="AthleteForm-photoPreview" src={photoUrl} alt="Pré-visualização" />}
        <input id="athlete-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
        {photoError && <p className="field-error">{photoError}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="athlete-age">Idade</label>
        <input id="athlete-age" type="number" min={0} value={age} onChange={(event) => setAge(event.target.value)} />
      </div>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  )
}

export default AthleteForm
