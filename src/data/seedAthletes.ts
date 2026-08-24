import type { Athlete } from '../types/athlete'

export const seedAthletes: Athlete[] = [
  {
    id: 'serena-williams',
    name: 'Serena Williams',
    sport: 'Tênis',
    team: 'Estados Unidos',
    nationality: 'Americana',
    age: 42,
    evolutionHistory: [
      {
        id: 'ev-1',
        date: '2026-06-01T00:00:00.000Z',
        xpGained: 50,
        note: 'Vitória em torneio local',
      },
      {
        id: 'ev-2',
        date: '2026-07-15T00:00:00.000Z',
        xpGained: 30,
        note: 'Treino intensivo de saque',
      },
    ],
  },
  {
    id: 'neymar-jr',
    name: 'Neymar Jr.',
    sport: 'Futebol',
    team: 'Santos FC',
    nationality: 'Brasileira',
    age: 33,
    evolutionHistory: [
      {
        id: 'ev-3',
        date: '2026-05-10T00:00:00.000Z',
        xpGained: 20,
        note: 'Retorno de lesão, treino leve',
      },
    ],
  },
]
