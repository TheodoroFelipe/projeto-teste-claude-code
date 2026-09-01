'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import DayPlanEditor from '../components/DayPlanEditor'
import { sendPlanInviteAction, updateCoachPlanWeeklyPlanAction } from '../app/actions/coachPlans'
import { WEEK_DAYS, getDayPlan } from '../utils/trainingPlan'
import type { CoachPlan, PlanInvite } from '../types/coachPlan'
import type { PlannedExercise, WeeklyPlan } from '../types/trainingPlan'

const SHORT_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

const STATUS_LABELS: Record<PlanInvite['status'], string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  declined: 'Recusado',
}

interface CoachPlanEditorPageProps {
  plan: CoachPlan
  initialInvites: PlanInvite[]
}

function CoachPlanEditorPage({ plan, initialInvites }: CoachPlanEditorPageProps) {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(plan.weeklyPlan)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [invites, setInvites] = useState<PlanInvite[]>(initialInvites)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)

  function handleAdd(dayIndex: number, exercise: PlannedExercise) {
    setSaved(false)
    setWeeklyPlan((prev) =>
      prev.map((dayPlan, index) =>
        index === dayIndex ? { ...dayPlan, exercises: [...dayPlan.exercises, exercise] } : dayPlan,
      ),
    )
  }

  function handleEdit(dayIndex: number, exercise: PlannedExercise) {
    setSaved(false)
    setWeeklyPlan((prev) =>
      prev.map((dayPlan, index) =>
        index === dayIndex
          ? { ...dayPlan, exercises: dayPlan.exercises.map((e) => (e.id === exercise.id ? exercise : e)) }
          : dayPlan,
      ),
    )
  }

  function handleRemove(dayIndex: number, exerciseId: string) {
    setSaved(false)
    setWeeklyPlan((prev) =>
      prev.map((dayPlan, index) =>
        index === dayIndex
          ? { ...dayPlan, exercises: dayPlan.exercises.filter((exercise) => exercise.id !== exerciseId) }
          : dayPlan,
      ),
    )
  }

  async function handleSave() {
    setIsSaving(true)
    await updateCoachPlanWeeklyPlanAction(plan.id, weeklyPlan)
    setIsSaving(false)
    setSaved(true)
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!inviteEmail.trim()) return
    setIsInviting(true)
    setInviteError(null)
    const result = await sendPlanInviteAction(plan.id, inviteEmail.trim())
    setIsInviting(false)
    if (!result.ok) {
      setInviteError(result.error)
      return
    }
    setInvites((prev) => [
      ...prev.filter((invite) => invite.athleteEmail !== inviteEmail.trim().toLowerCase()),
      {
        id: `pending-${Date.now()}`,
        planId: plan.id,
        planName: plan.name,
        coachName: '',
        athleteEmail: inviteEmail.trim().toLowerCase(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ])
    const subject = encodeURIComponent(`Convite para o plano de treino "${plan.name}"`)
    const body = encodeURIComponent(
      `Olá, ${result.athleteName}!\n\nVocê recebeu um convite para o plano de treino "${plan.name}" no APEX. Acesse sua conta e confira o convite em "Perfil".`,
    )
    window.open(`mailto:${inviteEmail.trim()}?subject=${subject}&body=${body}`, '_blank')
    setInviteEmail('')
  }

  const selectedDayPlan = getDayPlan(weeklyPlan, WEEK_DAYS[selectedDayIndex].day)

  return (
    <div className="Page">
      <Link className="Page-backLink" href="/coach/plans">
        &larr; Voltar para meus planos
      </Link>
      <h1 className="Page-title">{plan.name}</h1>

      <div className="TrainingPlanPage-dayRow">
        {WEEK_DAYS.map(({ day, label }, index) => {
          const hasExercises = getDayPlan(weeklyPlan, day).exercises.length > 0
          return (
            <button
              key={day}
              type="button"
              className={`TrainingPlanPage-dayPill${index === selectedDayIndex ? ' active' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
              aria-label={label}
            >
              <span>{SHORT_LABELS[index]}</span>
              <span className={`TrainingPlanPage-dayDot${hasExercises ? '' : ' empty'}`} />
            </button>
          )
        })}
      </div>

      <DayPlanEditor
        key={WEEK_DAYS[selectedDayIndex].day}
        dayLabel={WEEK_DAYS[selectedDayIndex].label}
        exercises={selectedDayPlan.exercises}
        onAdd={(exercise) => handleAdd(selectedDayIndex, exercise)}
        onEdit={(exercise) => handleEdit(selectedDayIndex, exercise)}
        onRemove={(exerciseId) => handleRemove(selectedDayIndex, exerciseId)}
      />

      <button type="button" className="btn-primary" onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'SALVANDO...' : 'SALVAR PLANO'}
      </button>
      {saved && <p className="Page-empty">Plano salvo.</p>}

      <div className="card">
        <div className="section-title" style={{ marginBottom: 10 }}>
          Compartilhar com um atleta
        </div>
        <form className="CoachPlansPage-inviteForm" onSubmit={handleInvite}>
          <div className="field-group">
            <label htmlFor="invite-email">E-mail do atleta cadastrado</label>
            <input
              id="invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
            />
          </div>
          {inviteError && <p className="field-error">{inviteError}</p>}
          <button type="submit" className="btn-secondary" disabled={isInviting}>
            {isInviting ? 'Enviando...' : 'Enviar convite'}
          </button>
        </form>

        {invites.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {invites.map((invite) => (
              <div className="UserProfilePage-timelineRow" key={invite.id}>
                <span className="UserProfilePage-timelineNote">{invite.athleteEmail}</span>
                <span className="chip">{STATUS_LABELS[invite.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoachPlanEditorPage
