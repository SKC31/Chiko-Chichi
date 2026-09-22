import { useState } from 'react'
import { friendlyError } from '@/lib/errors'
import { submitRsvp } from '@/services/rsvp'
import { useInvitation } from './InvitationContext'

type Choice = 'attending' | 'declined'

export function Rsvp() {
  const { code, guest, setGuest } = useInvitation()
  const answered = guest.rsvp_status !== 'pending'
  const [editing, setEditing] = useState(false)
  const [choice, setChoice] = useState<Choice | null>(answered ? (guest.rsvp_status as Choice) : null)
  const [count, setCount] = useState(guest.attendee_count > 0 ? guest.attendee_count : Math.min(1, guest.allowed_guests))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  const showSummary = answered && !editing

  async function save() {
    if (!choice || busy) return
    setError('')
    setBusy(true)
    try {
      const next = await submitRsvp(code, choice, choice === 'attending' ? count : null)
      setGuest(next)
      setEditing(false)
      setJustSaved(true)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sec sec--black rsvp" aria-labelledby="rsvp-title">
      <h2 className="sec__title" id="rsvp-title">
        RSVP
      </h2>

      {showSummary ? (
        <div className="notice notice--ok" role="status">
          {justSaved && <p className="notice__lead">Thank you, {guest.display_name}.</p>}
          {guest.rsvp_status === 'attending' ? (
            <p>
              {justSaved ? 'Your reply is saved. ' : ''}
              We can’t wait to celebrate with you.
            </p>
          ) : (
            <p>
              {justSaved ? 'Your reply is saved. ' : ''}
              You have let us know that you cannot attend. You will be missed, and we are grateful for your love.
            </p>
          )}
          <button type="button" className="link-btn" onClick={() => { setEditing(true); setJustSaved(false) }}>
            Change my reply
          </button>
        </div>
      ) : (
        <>
          <p className="sec__intro rsvp__question">Will you join us in celebrating this special day?</p>

          <div className="choice-row" role="radiogroup" aria-label="Your reply">
            <button
              type="button"
              role="radio"
              aria-checked={choice === 'attending'}
              aria-label="Confirm attendance"
              className={`choice${choice === 'attending' ? ' is-selected' : ''}`}
              onClick={() => setChoice('attending')}
            >
              Joyfully accept
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={choice === 'declined'}
              aria-label="Decline invitation"
              className={`choice${choice === 'declined' ? ' is-selected' : ''}`}
              onClick={() => setChoice('declined')}
            >
              Regretfully decline
            </button>
          </div>

          {choice === 'attending' && (
            <div className="field">
              {guest.allowed_guests > 1 ? (
                <>
                  <label htmlFor="rsvp-count">Number attending</label>
                  <select id="rsvp-count" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                    {Array.from({ length: guest.allowed_guests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                  <p className="field__hint">Your invitation is for up to {guest.allowed_guests} guests.</p>
                </>
              ) : (
                <p className="field__hint">This invitation is for 1 guest.</p>
              )}
            </div>
          )}

          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}

          <button type="button" className="btn btn--primary" onClick={save} disabled={!choice || busy}>
            {busy ? 'Saving…' : 'Send my reply'}
          </button>
          {editing && (
            <button type="button" className="link-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}
        </>
      )}
    </section>
  )
}
