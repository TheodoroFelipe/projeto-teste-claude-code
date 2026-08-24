import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MIN_PASSWORD_LENGTH } from '../utils/validation'
import './RegisterPage.css'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await register({ name, email, password, confirmPassword })
    setIsSubmitting(false)

    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="RegisterPage">
      <form className="RegisterPage-form" onSubmit={handleSubmit}>
        <h2>Criar conta</h2>
        {error && <p className="RegisterPage-error">{error}</p>}
        <label htmlFor="register-name">Nome</label>
        <input id="register-name" type="text" required value={name} onChange={(event) => setName(event.target.value)} />
        <label htmlFor="register-email">E-mail</label>
        <input
          id="register-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="register-password">Senha</label>
        <input
          id="register-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <label htmlFor="register-confirm-password">Confirmar senha</label>
        <input
          id="register-confirm-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>
        <Link to="/login">Já tenho conta</Link>
      </form>
    </div>
  )
}

export default RegisterPage
