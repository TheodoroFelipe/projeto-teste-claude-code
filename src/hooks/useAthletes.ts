import { useContext } from 'react'
import { AthleteContext } from '../context/AthleteContext'
import type { AthleteContextValue } from '../context/AthleteContext'

export function useAthletes(): AthleteContextValue {
  const context = useContext(AthleteContext)
  if (context === undefined) {
    throw new Error('useAthletes must be used within an AthleteProvider')
  }
  return context
}
