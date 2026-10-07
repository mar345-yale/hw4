import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function CreateAccount() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const update = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) {
      setError('Passwords need at least 8 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Those passwords don’t match.')
      return
    }
    setBusy(true)
    try {
      await signup({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Join the Bulldog family</span>
        <h1>Create account</h1>
        <p className="muted">Save your favorites and keep your chats with our shop helper.</p>

        <div className="form-row">
          <label>
            First name
            <input required autoComplete="given-name" value={form.firstName} onChange={update('firstName')} />
          </label>
          <label>
            Last name
            <input required autoComplete="family-name" value={form.lastName} onChange={update('lastName')} />
          </label>
        </div>
        <label>
          Email
          <input type="email" required autoComplete="email" value={form.email} onChange={update('email')} />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={update('confirm')}
          />
        </label>

        {error && <p className="notice error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="muted small">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  )
}
