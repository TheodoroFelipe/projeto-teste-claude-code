import { createContext } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/id'
import { seedAthletes } from '../data/seedAthletes'
import type { Athlete, NewAthleteInput, NewEvolutionEntryInput } from '../types/athlete'

export interface AthleteContextValue {
  athletes: Athlete[]
  getAthleteById: (id: string) => Athlete | undefined
  addAthlete: (input: NewAthleteInput) => void
  updateAthlete: (athleteId: string, input: NewAthleteInput) => void
  addEvolutionEntry: (athleteId: string, input: NewEvolutionEntryInput) => void
}

export const AthleteContext = createContext<AthleteContextValue | undefined>(undefined)

interface AthleteProviderProps {
  children: ReactNode
}

function AthleteProvider({ children }: AthleteProviderProps) {
  const [athletes, setAthletes] = useLocalStorage<Athlete[]>('projeto-teste:athletes', seedAthletes)

  function getAthleteById(id: string): Athlete | undefined {
    return athletes.find((athlete) => athlete.id === id)
  }

  function addAthlete(input: NewAthleteInput): void {
    const newAthlete: Athlete = {
      ...input,
      id: generateId(),
      evolutionHistory: [],
    }
    setAthletes((prev) => [...prev, newAthlete])
  }

  function updateAthlete(athleteId: string, input: NewAthleteInput): void {
    setAthletes((prev) =>
      prev.map((athlete) => (athlete.id === athleteId ? { ...athlete, ...input } : athlete)),
    )
  }

  function addEvolutionEntry(athleteId: string, input: NewEvolutionEntryInput): void {
    const newEntry = {
      ...input,
      id: generateId(),
      date: new Date().toISOString(),
    }
    setAthletes((prev) =>
      prev.map((athlete) =>
        athlete.id === athleteId
          ? { ...athlete, evolutionHistory: [...athlete.evolutionHistory, newEntry] }
          : athlete,
      ),
    )
  }

  return (
    <AthleteContext.Provider
      value={{ athletes, getAthleteById, addAthlete, updateAthlete, addEvolutionEntry }}
    >
      {children}
    </AthleteContext.Provider>
  )
}

export default AthleteProvider
