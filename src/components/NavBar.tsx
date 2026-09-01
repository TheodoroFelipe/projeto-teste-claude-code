'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'

interface NavItem {
  to: string
  label: string
  icon: JSX.Element
}

function TreinoIcon() {
  return (
    <svg className="NavBar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3 4 14h6l-1 7 9-11h-6z" />
    </svg>
  )
}

function RankingIcon() {
  return (
    <svg className="NavBar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
      <path d="M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10 17h4l.5 3h-5z" />
    </svg>
  )
}

function EvolucaoIcon() {
  return (
    <svg className="NavBar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

function PerfilIcon() {
  return (
    <svg className="NavBar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

function NavBar() {
  const { currentUser } = useAuth()
  const pathname = usePathname()

  if (!currentUser) return null

  const items: NavItem[] = [
    { to: '/treino-do-dia', label: 'Treino', icon: <TreinoIcon /> },
    { to: '/ranking', label: 'Ranking', icon: <RankingIcon /> },
    { to: `/athletes/${currentUser.athleteId}/evolution`, label: 'Evolução', icon: <EvolucaoIcon /> },
    { to: '/profile', label: 'Perfil', icon: <PerfilIcon /> },
  ]

  return (
    <nav className="NavBar" aria-label="Navegação principal">
      <div className="NavBar-inner">
        <Link className="NavBar-brand" href="/">
          <span className="NavBar-brandMark">A</span>
          <span className="NavBar-brandName">APEX</span>
        </Link>
        <ul className="NavBar-list">
          {items.map((item) => (
            <li key={item.to}>
              <Link href={item.to} className={`NavBar-item${pathname === item.to ? ' active' : ''}`}>
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
