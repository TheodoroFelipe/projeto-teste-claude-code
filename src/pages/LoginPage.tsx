import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await login({ email, password })
    setIsSubmitting(false)

    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="AuthPage">
      <div className="AuthPage-glow AuthPage-glowLime" />
      <div className="AuthPage-glow AuthPage-glowCoral" />
      <div className="AuthPage-wrap">
        <div className="AuthPage-brand">
          <span className="AuthPage-brandMark">A</span>
          <span className="AuthPage-brandName">APEX</span>
        </div>
        <p className="AuthPage-tagline">TREINO · EVOLUÇÃO · PERFORMANCE</p>

        <div className="AuthPage-spacer" />

        <div className="segmented AuthPage-segmented">
          <span className="segmented-item active">Entrar</span>
          <Link className="segmented-item" to="/register">
            Criar conta
          </Link>
        </div>

        <form className="AuthPage-form" onSubmit={handleSubmit}>
          {error && <p className="field-error">{error}</p>}
          <div className="field-group">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <p className="AuthPage-switchText">
          Ainda não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
