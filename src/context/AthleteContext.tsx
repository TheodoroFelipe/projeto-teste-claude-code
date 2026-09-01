'use client'

import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import {
  addAthleteAction,
  addEvolutionEntryAction,
  addMeasurementEntryAction,
  updateAthleteAction,
  updateWeeklyPlanAction,
} from '../app/actions/athletes'
import type { Athlete, NewAthleteInput, NewBodyMeasurementInput, NewEvolutionEntryInput } from '../types/athlete'
import type { WeeklyPlan } from '../types/trainingPlan'

export interface AthleteContextValue {
  athletes: Athlete[]
  getAthleteById: (id: string) => Athlete | undefined
  addAthlete: (input: NewAthleteInput) => Promise<Athlete>
  updateAthlete: (athleteId: string, input: NewAthleteInput) => Promise<Athlete>
  addEvolutionEntry: (athleteId: string, input: NewEvolutionEntryInput) => Promise<Athlete>
  updateWeeklyPlan: (athleteId: string, weeklyPlan: WeeklyPlan) => Promise<Athlete>
  addMeasurementEntry: (athleteId: string, input: NewBodyMeasurementInput) => Promise<Athlete>
  applyAthleteUpdate: (athlete: Athlete) => void
}

export const AthleteContext = createContext<AthleteContextValue | undefined>(undefined)

interface AthleteProviderProps {
  children: ReactNode
  initialAthletes: Athlete[]
}

function AthleteProvider({ children, initialAthletes }: AthleteProviderProps) {
  const [athletes, setAthletes] = useState<Athlete[]>(initialAthletes)

  function getAthleteById(id: string): Athlete | undefined {
    return athletes.find((athlete) => athlete.id === id)
  }

  async function addAthlete(input: NewAthleteInput): Promise<Athlete> {
    const created = await addAthleteAction(input)
    setAthletes((prev) => [...prev, created])
    return created
  }

  async function updateAthlete(athleteId: string, input: NewAthleteInput): Promise<Athlete> {
    const updated = await updateAthleteAction(athleteId, input)
    setAthletes((prev) => prev.map((athlete) => (athlete.id === athleteId ? updated : athlete)))
    return updated
  }

  async function addEvolutionEntry(athleteId: string, input: NewEvolutionEntryInput): Promise<Athlete> {
    const updated = await addEvolutionEntryAction(athleteId, input)
    setAthletes((prev) => prev.map((athlete) => (athlete.id === athleteId ? updated : athlete)))
    return updated
  }

  async function updateWeeklyPlan(athleteId: string, weeklyPlan: WeeklyPlan): Promise<Athlete> {
    const updated = await updateWeeklyPlanAction(athleteId, weeklyPlan)
    setAthletes((prev) => prev.map((athlete) => (athlete.id === athleteId ? updated : athlete)))
    return updated
  }

  async function addMeasurementEntry(athleteId: string, input: NewBodyMeasurementInput): Promise<Athlete> {
    const updated = await addMeasurementEntryAction(athleteId, input)
    setAthletes((prev) => prev.map((athlete) => (athlete.id === athleteId ? updated : athlete)))
    return updated
  }

  function applyAthleteUpdate(athlete: Athlete): void {
    setAthletes((prev) => prev.map((existing) => (existing.id === athlete.id ? athlete : existing)))
  }

  return (
    <AthleteContext.Provider
      value={{
        athletes,
        getAthleteById,
        addAthlete,
        updateAthlete,
        addEvolutionEntry,
        updateWeeklyPlan,
        addMeasurementEntry,
        applyAthleteUpdate,
      }}
    >
      {children}
    </AthleteContext.Provider>
  )
}

export default AthleteProvider
