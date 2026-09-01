import { db } from '../src/db'
import { athletes, evolutionEntries } from '../src/db/schema'

async function seed() {
  const [serena] = await db
    .insert(athletes)
    .values({ name: 'Serena Williams', sport: 'Tênis', team: 'Estados Unidos', nationality: 'Americana', age: 42 })
    .returning()

  await db.insert(evolutionEntries).values([
    {
      athleteId: serena.id,
      date: new Date('2026-06-01T00:00:00.000Z'),
      xpGained: 50,
      note: 'Vitória em torneio local',
    },
    {
      athleteId: serena.id,
      date: new Date('2026-07-15T00:00:00.000Z'),
      xpGained: 30,
      note: 'Treino intensivo de saque',
    },
  ])

  const [neymar] = await db
    .insert(athletes)
    .values({
      name: 'Neymar Jr.',
      sport: 'Futebol',
      team: 'Santos FC',
      nationality: 'Brasileira',
      age: 33,
      weeklyPlan: [
        {
          day: 'monday',
          exercises: [
            { id: 'ex-1', name: 'Agachamento livre', modality: 'musculacao', targetSets: 4, targetReps: 8, targetLoadKg: 100 },
            { id: 'ex-2', name: 'Supino reto', modality: 'musculacao', targetSets: 4, targetReps: 8, targetLoadKg: 70 },
          ],
        },
        { day: 'tuesday', exercises: [{ id: 'ex-3', name: 'Nado livre', modality: 'natacao', targetDistanceMeters: 1000, targetDurationMin: 25 }] },
        { day: 'wednesday', exercises: [{ id: 'ex-4', name: 'Levantamento terra', modality: 'musculacao', targetSets: 4, targetReps: 5, targetLoadKg: 120 }] },
        { day: 'thursday', exercises: [] },
        { day: 'friday', exercises: [{ id: 'ex-5', name: 'Corrida leve', modality: 'corrida', targetDistanceKm: 6, targetDurationMin: 35 }] },
        { day: 'saturday', exercises: [] },
        { day: 'sunday', exercises: [] },
      ],
    })
    .returning()

  await db.insert(evolutionEntries).values({
    athleteId: neymar.id,
    date: new Date('2026-05-10T00:00:00.000Z'),
    xpGained: 20,
    note: 'Retorno de lesão, treino leve',
  })

  console.log('Seed concluído:', { serena: serena.id, neymar: neymar.id })
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
