import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import AuthProvider from './context/AuthContext.tsx'
import AthleteProvider from './context/AthleteContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AthleteProvider>
          <App />
        </AthleteProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
