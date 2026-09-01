'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useAthletes } from '../hooks/useAthletes'
import { SPORT_OPTIONS } from '../utils/sports'
import { isValidEmail, MIN_PASSWORD_LENGTH } from '../utils/validation'

const OTHER_SPORT_OPTION = 'Outro'

function RegisterPage() {
  const { register, isEmailTaken } = useAuth()
  const { addAthlete } = useAthletes()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sport, setSport] = useState('')
  const [customSport, setCustomSport] = useState('')
  const [isCoach, setIsCoach] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Nome é obrigatório.')
    if (!isValidEmail(email)) return setError('E-mail inválido.')
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`)
    }
    if (password !== confirmPassword) return setError('As senhas não coincidem.')
    if (!sport) return setError('Modalidade principal é obrigatória.')
    const finalSport = sport === OTHER_SPORT_OPTION ? customSport.trim() : sport
    if (!finalSport) return setError('Informe a modalidade.')
    if (await isEmailTaken(email)) return setError('Este e-mail já está cadastrado.')

    setIsSubmitting(true)
    const newAthlete = await addAthlete({ name: name.trim(), sport: finalSport, team: '', nationality: '' })

    const result = await register({
      name,
      email,
      password,
      confirmPassword,
      athleteId: newAthlete.id,
      role: isCoach ? 'coach' : 'athlete',
    })
    setIsSubmitting(false)

    if (result.ok) {
      router.replace('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="AuthPage">
      <div className="AuthPage-glow AuthPage-glowLime" />
      <div className="AuthPage-glow AuthPage-glowCoral" />
      <div className="AuthPage-wrap AuthPage-wrap-register">
        <div className="AuthPage-brand">
          <span className="AuthPage-brandMark">A</span>
          <span className="AuthPage-brandName">APEX</span>
        </div>
        <p className="AuthPage-tagline">TREINO · EVOLUÇÃO · PERFORMANCE</p>

        <div className="segmented AuthPage-segmented" style={{ marginTop: 24 }}>
          <Link className="segmented-item" href="/login">
            Entrar
          </Link>
          <span className="segmented-item active">Criar conta</span>
        </div>

        <form className="AuthPage-form" onSubmit={handleSubmit}>
          {error && <p className="field-error">{error}</p>}
          <div className="field-group">
            <label htmlFor="register-name">Nome</label>
            <input id="register-name" type="text" required value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="register-confirm-password">Confirmar senha</label>
            <input
              id="register-confirm-password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="register-sport">Modalidade principal</label>
            <select id="register-sport" required value={sport} onChange={(event) => setSport(event.target.value)}>
              <option value="" disabled>
                Selecione uma modalidade
              </option>
              {SPORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {sport === OTHER_SPORT_OPTION && (
            <div className="field-group">
              <label htmlFor="register-custom-sport">Qual modalidade?</label>
              <input
                id="register-custom-sport"
                type="text"
                required
                value={customSport}
                onChange={(event) => setCustomSport(event.target.value)}
              />
            </div>
          )}
          <label className="RegisterPage-checkboxLabel">
            <input type="checkbox" checked={isCoach} onChange={(event) => setIsCoach(event.target.checked)} />
            Sou treinador
          </label>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
          </button>
        </form>

        <p className="AuthPage-switchText">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
