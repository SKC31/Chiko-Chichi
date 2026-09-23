import { useState, type FormEvent } from 'react'
import { friendlyError } from '@/lib/errors'
import type { GuestInput, GuestRow } from '@/lib/types'
import { createGuest, updateGuest } from '@/services/admin'

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Mr. & Mrs.', 'Dr.', 'Pastor', 'Rev.', 'The', 'Family']

interface Props {
  guest?: GuestRow
  onCancel: () => void
  onSaved: (g: GuestRow, created: boolean) => void
}

export function GuestForm({ guest, onCancel, onSaved }: Props) {
  const [f, setF] = useState<GuestInput>({
    title: guest?.title ?? '',
    first_name: guest?.first_name ?? '',
    last_name: guest?.last_name ?? '',
    display_name: guest?.display_name ?? '',
    phone: guest?.phone ?? '',
    email: guest?.email ?? '',
    allowed_guests: guest?.allowed_guests ?? 1,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof GuestInput>(k: K, v: GuestInput[K]) => setF((p) => ({ ...p, [k]: v }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!f.display_name.trim() && !f.first_name.trim() && !f.last_name.trim()) {
      setError('Enter a display name, or at least a first or last name.')
      return
    }
    if (!Number.isInteger(f.allowed_guests) || f.allowed_guests < 1 || f.allowed_guests > 20) {
      setError('Number of guests allowed must be a whole number from 1 to 20.')
      return
    }
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) {
      setError('That email address does not look right.')
      return
    }
    if (f.phone.trim() && !/^[0-9+ ()-]{7,20}$/.test(f.phone.trim())) {
      setError('Phone numbers may only contain digits, spaces, + ( ) and -.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const saved = guest ? await updateGuest(guest.id, f) : await createGuest(f)
      onSaved(saved, !guest)
    } catch (err) {
      setError(friendlyError(err, 'Could not save the guest.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="a-card" onSubmit={submit} noValidate>
      <h2 id="guest-form-title">{guest ? 'Edit guest' : 'Add a guest'}</h2>
      <div className="a-grid">
        <div className="a-field">
          <label htmlFor="g-title">Title</label>
          <input id="g-title" list="g-titles" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Mr. & Mrs." />
          <datalist id="g-titles">
            {TITLES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div className="a-field">
          <label htmlFor="g-first">First name</label>
          <input id="g-first" value={f.first_name} onChange={(e) => set('first_name', e.target.value)} />
        </div>
        <div className="a-field">
          <label htmlFor="g-last">Last name</label>
          <input id="g-last" value={f.last_name} onChange={(e) => set('last_name', e.target.value)} />
        </div>
        <div className="a-field a-field--wide">
          <label htmlFor="g-display">Display name</label>
          <input
            id="g-display"
            value={f.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            placeholder="e.g. Mr. & Mrs. Banda, or The Phiri Family"
          />
          <p className="a-hint">This is what appears after “Dear”. Leave blank to build it from title + names.</p>
        </div>
        <div className="a-field">
          <label htmlFor="g-phone">Phone (for WhatsApp)</label>
          <input id="g-phone" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0977 000 000" />
        </div>
        <div className="a-field">
          <label htmlFor="g-email">Email</label>
          <input id="g-email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="a-field">
          <label htmlFor="g-allowed">Number of guests allowed</label>
          <input
            id="g-allowed"
            type="number"
            min={1}
            max={20}
            value={f.allowed_guests}
            onChange={(e) => set('allowed_guests', Number(e.target.value))}
          />
        </div>
      </div>

      {error && (
        <p className="a-alert a-alert--bad" role="alert">
          {error}
        </p>
      )}
      <div className="a-actions">
        <button type="submit" className="a-btn a-btn--primary" disabled={busy}>
          {busy ? 'Saving…' : guest ? 'Save changes' : 'Create guest'}
        </button>
        <button type="button" className="a-btn a-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
