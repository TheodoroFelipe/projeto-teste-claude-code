'use client'

import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { isPro } from '../utils/plan'

const FREE_FEATURES = ['Registrar treinos e ganhar XP', 'Plano semanal e treino do dia', 'Calendário e evolução física']
const PRO_FEATURES = [
  'Treinos gerados por agentes de IA (em breve)',
  'Ranking geral com XP e nível de todos os usuários',
  'Tudo do plano Grátis',
]

function PlansPage() {
  const { currentUser } = useAuth()
  const userIsPro = isPro(currentUser)

  return (
    <div className="Page PlansPage">
      <div>
        <span className="Page-eyebrow">Planos</span>
        <h1 className="Page-title">Como você quer continuar?</h1>
      </div>

      <div className="PlansPage-grid">
        <div className="card PlansPage-card">
          <span className="chip">GRÁTIS</span>
          <h2 className="PlansPage-cardTitle">Começar no Grátis</h2>
          <ul className="PlansPage-features">
            {FREE_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          {userIsPro ? (
            <span className="PlansPage-note">Incluído no seu plano.</span>
          ) : (
            <Link className="btn-secondary" href="/">
              Continuar grátis
            </Link>
          )}
        </div>

        <div className="card PlansPage-card PlansPage-card--pro">
          <span className="chip PlansPage-proTag">★ PRO</span>
          <h2 className="PlansPage-cardTitle">Apex Pro</h2>
          <ul className="PlansPage-features">
            {PRO_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          {userIsPro ? (
            <span className="PlansPage-note">Este é o seu plano atual.</span>
          ) : (
            <button type="button" className="btn-primary" disabled>
              EM BREVE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlansPage
