'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createCoachPlanAction } from '../app/actions/coachPlans'
import type { CoachPlan } from '../types/coachPlan'

interface CoachPlansPageProps {
  initialPlans: CoachPlan[]
}

function CoachPlansPage({ initialPlans }: CoachPlansPageProps) {
  const router = useRouter()
  const [plans, setPlans] = useState<CoachPlan[]>(initialPlans)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const created = await createCoachPlanAction(name.trim())
      setPlans((prev) => [...prev, created])
      router.push(`/coach/plans/${created.id}`)
    } catch {
      setError('Não foi possível criar o plano.')
      setIsCreating(false)
    }
  }

  return (
    <div className="Page">
      <Link className="Page-backLink" href="/">
        &larr; Voltar
      </Link>
      <h1 className="Page-title">Meus planos de treino</h1>

      <form className="card CoachPlansPage-form" onSubmit={handleCreate}>
        <div className="field-group">
          <label htmlFor="coach-plan-name">Novo plano</label>
          <input
            id="coach-plan-name"
            type="text"
            placeholder="Ex.: Pré-temporada — corrida"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={isCreating}>
          {isCreating ? 'Criando...' : 'Criar plano'}
        </button>
      </form>

      <div className="CoachPlansPage-list">
        {plans.length === 0 ? (
          <p className="Page-empty">Nenhum plano criado ainda.</p>
        ) : (
          plans.map((plan) => (
            <Link key={plan.id} className="card CoachPlansPage-item" href={`/coach/plans/${plan.id}`}>
              <span className="CoachPlansPage-itemName">{plan.name}</span>
              <span className="Page-eyebrow">Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default CoachPlansPage
