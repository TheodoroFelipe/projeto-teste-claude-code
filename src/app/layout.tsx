import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { JetBrains_Mono, Manrope, Sora } from 'next/font/google'
import { Providers } from './providers'
import { listAthletesAction } from './actions/athletes'
import { getCurrentUser } from '../lib/session'

import '../index.css'
import '../App.css'
import '../components/AthleteCard.css'
import '../components/AthleteForm.css'
import '../components/DayPlanEditor.css'
import '../components/ExerciseLogger.css'
import '../components/TrendLineChart.css'
import '../screens/AthleteProfilePage.css'
import '../screens/BodyMeasurementsPage.css'
import '../screens/HomePage.css'
import '../screens/LoginPage.css'
import '../screens/RankingPage.css'
import '../screens/RegisterPage.css'
import '../screens/TodayWorkoutPage.css'
import '../screens/TrainingPlanPage.css'
import '../screens/TrainingSessionPage.css'
import '../screens/UserProfilePage.css'

const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-sora' })
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-manrope' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Projeto Teste Claude Code',
  icons: { icon: '/vite.svg' },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [initialUser, initialAthletes] = await Promise.all([getCurrentUser(), listAthletesAction()])

  return (
    <html lang="pt-BR" className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers initialUser={initialUser} initialAthletes={initialAthletes}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
