import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About Us' },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="announce">Officially licensed Yale gear · 57 Broadway, New Haven</div>
      <nav className="nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">CC</span>
          <span className="brand-text">
            Campus Customs
            <small>Yale Bulldog Blue</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <span className="nav-greeting">Hi, {user.first_name ?? 'Bulldog'}</span>
              <button className="btn btn-ghost nav-cta" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close} className="nav-login">
                Log In
              </NavLink>
              <NavLink to="/create-account" onClick={close} className="btn btn-primary nav-cta">
                Create Account
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
