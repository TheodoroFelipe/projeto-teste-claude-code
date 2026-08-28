import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RankingPage from './pages/RankingPage'
import AthleteProfilePage from './pages/AthleteProfilePage'
import TrainingSessionPage from './pages/TrainingSessionPage'
import TrainingPlanPage from './pages/TrainingPlanPage'
import TodayWorkoutPage from './pages/TodayWorkoutPage'
import BodyMeasurementsPage from './pages/BodyMeasurementsPage'
import NewAthletePage from './pages/NewAthletePage'
import EditAthletePage from './pages/EditAthletePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserProfilePage from './pages/UserProfilePage'
import RequireAuth from './components/RequireAuth'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { currentUser, isAuthenticated, logout } = useAuth()

  return (
    <div className="App">
      <header className="App-header">
        <h1>Projeto Teste Claude Code</h1>
        {isAuthenticated && currentUser && (
          <nav className="App-nav">
            <Link to="/treino-do-dia">Treino do dia</Link>
            <Link to={`/athletes/${currentUser.athleteId}/plan`}>Plano semanal</Link>
            <Link to={`/athletes/${currentUser.athleteId}/evolution`}>Evolução</Link>
            <Link to="/ranking">Ranking</Link>
            <Link to="/profile">{currentUser.name}</Link>
            <button type="button" onClick={logout}>
              Sair
            </button>
          </nav>
        )}
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/ranking"
          element={
            <RequireAuth>
              <RankingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/athletes/new"
          element={
            <RequireAuth>
              <NewAthletePage />
            </RequireAuth>
          }
        />
        <Route
          path="/athletes/:athleteId"
          element={
            <RequireAuth>
              <AthleteProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/athletes/:athleteId/session"
          element={
            <RequireAuth>
              <TrainingSessionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/athletes/:athleteId/plan"
          element={
            <RequireAuth>
              <TrainingPlanPage />
            </RequireAuth>
          }
        />
        <Route
          path="/athletes/:athleteId/edit"
          element={
            <RequireAuth>
              <EditAthletePage />
            </RequireAuth>
          }
        />
        <Route
          path="/athletes/:athleteId/evolution"
          element={
            <RequireAuth>
              <BodyMeasurementsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/treino-do-dia"
          element={
            <RequireAuth>
              <TodayWorkoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <UserProfilePage />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  )
}

export default App
