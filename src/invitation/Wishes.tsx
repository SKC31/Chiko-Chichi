import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { friendlyError } from '@/lib/errors'
import type { PublicWish } from '@/lib/types'
import { getPublicWishes, submitWish } from '@/services/wishes'
import { useInvitation } from './InvitationContext'

const MAX = 500
const AUTOPLAY_MS = 5000
const RESUME_AFTER_MS = 6000

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
      {wishes && wishes.length > 0 && <WishesCoverflow wishes={wishes} />}
    </section>
  )
}

/**
 * Coverflow carousel for wishes, styled after the photo gallery's 3D "window"
 * cards (see Gallery.tsx / .cf in invitation.css) but sized and scrollable
 * for text instead of a fixed-ratio image.
 */
function WishesCoverflow({ wishes }: { wishes: PublicWish[] }) {
  const count = wishes.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)
  const resumeTimer = useRef<number | null>(null)

  const go = useCallback((i: number) => setActive(((i % count) + count) % count), [count])

  const pauseThenResume = useCallback(() => {
    setPaused(true)
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
    resumeTimer.current = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS)
  }, [])

  const goUser = useCallback(
    (i: number) => {
      go(i)
      pauseThenResume()
    },
    [go, pauseThenResume],
  )

  useEffect(() => {
    if (paused || count <= 1) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, count])

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
    }
  }, [])

  // Keep the active slide in range if the wish list shrinks/grows after a refresh.
  useEffect(() => {
    setActive((a) => Math.min(a, count - 1))
  }, [count])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goUser(active - 1)
    if (e.key === 'ArrowRight') goUser(active + 1)
  }
  const onDown = (e: PointerEvent) => {
    startX.current = e.clientX
  }
  const onUp = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 40) goUser(active + (dx < 0 ? 1 : -1))
  }

  return (
    <>
      <div
        className="cf cf--wishes"
        role="group"
        aria-roledescription="carousel"
        aria-label="Wishes from our loved ones"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (startX.current = null)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
          setPaused(false)
        }}
      >
        {wishes.map((w, i) => {
          const o = i - active
          return (
            <figure
              key={w.id}
              className={`cf__slide cf__slide--wish${o === 0 ? ' is-active' : ''}`}
              style={{ ['--o' as string]: o, ['--abs' as string]: Math.abs(o) }}
              aria-hidden={o !== 0}
              onClick={() => o !== 0 && goUser(i)}
            >
              <div className="wish-card">
                <p className="wish-card__text">{w.message}</p>
                <p className="wish-card__author">{w.author}</p>
              </div>
            </figure>
          )
        })}
      </div>

      <div className="cf__nav">
        <button type="button" className="cf__arrow" onClick={() => goUser(active - 1)} aria-label="Previous wish">
          ‹
        </button>
        <div className="cf__dots" role="tablist" aria-label="Choose wish">
          {wishes.map((w, i) => (
            <button
              key={w.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Wish ${i + 1} of ${count}`}
              className={`cf__dot${i === active ? ' is-active' : ''}`}
              onClick={() => goUser(i)}
            />
          ))}
        </div>
        <button type="button" className="cf__arrow" onClick={() => goUser(active + 1)} aria-label="Next wish">
          ›
        </button>
      </div>
    </>
  )
}
