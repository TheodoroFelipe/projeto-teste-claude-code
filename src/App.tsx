import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AthleteProfilePage from './pages/AthleteProfilePage'
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
          <div className="App-headerAuth">
            <Link to="/profile">{currentUser.name}</Link>
            <button type="button" onClick={logout}>
              Sair
            </button>
          </div>
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
          path="/athletes/:athleteId/edit"
          element={
            <RequireAuth>
              <EditAthletePage />
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
