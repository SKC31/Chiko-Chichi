import { useEffect, useState } from 'react'
import { friendlyError } from '@/lib/errors'
import type { PublicWish } from '@/lib/types'
import { getPublicWishes, submitWish } from '@/services/wishes'
import { useInvitation } from './InvitationContext'

const MAX = 500

export function Wishes() {
  const { code, guest } = useInvitation()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const [wishes, setWishes] = useState<PublicWish[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let alive = true
    getPublicWishes()
      .then((w) => alive && setWishes(w))
      .catch(() => alive && setLoadFailed(true))
    return () => {
      alive = false
    }
  }, [])

  async function send() {
    if (busy) return
    const text = message.trim()
    if (text.length < 2) {
      setError('Please write a short message for the couple.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await submitWish(code, text)
      setSent(true)
      setMessage('')
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sec sec--olive wishes" aria-labelledby="wishes-title">
      <h2 className="sec__title" id="wishes-title">
        Leave a Wish
      </h2>
      <p className="sec__intro">Write a message or blessing for the couple.</p>

      <div className="field">
        <label htmlFor="wish-text">Your message</label>
        <textarea
          id="wish-text"
          rows={4}
          maxLength={MAX}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setSent(false)
          }}
        />
        <p className="field__hint field__hint--right">
          From {guest.display_name} · {message.length}/{MAX}
        </p>
      </div>

      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="notice notice--ok" role="status">
          Thank you. Your wish has been sent and will appear here once the couple have approved it.
        </p>
      )}

      <button type="button" className="btn btn--primary" onClick={send} disabled={busy} aria-label="Send wish">
        {busy ? 'Sending…' : 'Send wish'}
      </button>

      <h3 className="wishes__heading">Wishes from our loved ones</h3>
      {wishes === null && !loadFailed && <p className="wishes__empty">Loading wishes…</p>}
      {loadFailed && <p className="wishes__empty">We could not load the wishes just now.</p>}
      {wishes && wishes.length === 0 && <p className="wishes__empty">Be the first to leave a blessing.</p>}
      {wishes && wishes.length > 0 && (
        <ul className="wishes__list">
          {wishes.map((w) => (
            <li key={w.id} className="wish">
              <p className="wish__text">{w.message}</p>
              <p className="wish__author">{w.author}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
