import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { signOut } from '@/services/auth'
import { useAdminSession } from './useAdminSession'

const LINKS = [
  ['dashboard', 'Dashboard'],
  ['guests', 'Guests'],
  ['rsvps', 'RSVPs'],
  ['gifts', 'Gifts'],
  ['wishes', 'Wishes'],
] as const

/** Guards every admin page: signed in AND listed in the `admins` table. */
export function AdminLayout() {
  const { loading, session, isAdmin } = useAdminSession()

  if (loading) return <div className="admin admin--center">Loading…</div>
  if (!session) return <Navigate to="/admin/login" replace />

  if (!isAdmin) {
    return (
      <div className="admin admin--center">
        <div className="a-card a-card--narrow">
          <h1>Not authorised</h1>
          <p>
            You are signed in as <strong>{session.user.email}</strong>, but this account is not a wedding administrator.
          </p>
          <button className="a-btn" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="a-top">
        <p className="a-brand">Wedding admin</p>
        <nav aria-label="Admin" className="a-nav">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={`/admin/${to}`} className={({ isActive }) => `a-nav__link${isActive ? ' is-active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => void signOut()}>
          Sign out
        </button>
      </header>
      <main className="a-main">
        <Outlet />
      </main>
    </div>
  )
}
