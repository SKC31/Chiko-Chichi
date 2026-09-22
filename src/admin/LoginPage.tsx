import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '@/services/auth'
import { useAdminSession } from './useAdminSession'

export function LoginPage() {
  const navigate = useNavigate()
  const { session, isAdmin } = useAdminSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session && isAdmin) navigate('/admin/dashboard', { replace: true })
  }, [session, isAdmin, navigate])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setBusy(true)
    try {
      await signIn(email.trim(), password)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Sign-in failed. Check your email and password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin admin--center">
      <form className="a-card a-card--narrow" onSubmit={submit} noValidate>
        <h1>Administrator sign-in</h1>
        <div className="a-field">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="a-field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p className="a-alert a-alert--bad" role="alert">
            {error}
          </p>
        )}
        <button className="a-btn a-btn--primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
