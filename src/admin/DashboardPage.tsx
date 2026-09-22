import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listGuests, listWishes } from '@/services/admin'
import { ErrorBox, bringMoneySentence, useLoad } from './shared'

export function DashboardPage() {
  const guests = useLoad(listGuests)
  const wishes = useLoad(listWishes)

  const s = useMemo(() => {
    const active = (guests.data ?? []).filter((g) => g.is_active)
    const w = wishes.data ?? []
    const bring = active.filter((g) => g.gift?.method === 'bring_to_wedding')
    return {
      invites: active.length,
      total: active.reduce((n, g) => n + (g.allowed_guests || 1), 0),
      opened: active.filter((g) => g.opened_at || g.invitation_status === 'opened' || g.invitation_status === 'responded').length,
      responded: active.filter((g) => g.rsvp_status !== 'pending').length,
      attending: active.filter((g) => g.rsvp_status === 'attending').length,
      attendees: active.reduce((n, g) => n + (g.rsvp_status === 'attending' ? g.attendee_count : 0), 0),
      declined: active.filter((g) => g.rsvp_status === 'declined').length,
      pending: active.filter((g) => g.rsvp_status === 'pending').length,
      mobile: active.filter((g) => g.gift?.method === 'mobile_money').length,
      bring,
      wishes: w.length,
      wishesAwaiting: w.filter((x) => x.status === 'pending').length,
    }
  }, [guests.data, wishes.data])

  const reload = () => {
    void guests.reload()
    void wishes.reload()
  }
  const error = guests.error || wishes.error
  const loading = (guests.loading && !guests.data) || (wishes.loading && !wishes.data)

  const cards: [string, number | string, string?][] = [
    ['Total invitations', s.total, `${s.invites} sent`],
    ['Invitations opened', s.opened],
    ['Responded', s.responded],
    ['Attending', s.attending, `${s.attendees} people`],
    ['Declined', s.declined],
    ['Pending', s.pending],
    ['Mobile Money', s.mobile],
    ['Bring money to wedding', s.bring.length],
    ['Wishes received', s.wishes],
    ['Wishes awaiting approval', s.wishesAwaiting],
  ]

  return (
    <>
      <div className="a-head">
        <h1>Dashboard</h1>
        <button className="a-btn a-btn--ghost a-btn--sm" onClick={reload} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}

      {s.bring.length > 0 && (
        <section className="a-alert a-alert--gold" aria-label="Gift alert">
          <p>
            <span role="img" aria-label="Notification">
              🔔
            </span>{' '}
            <strong>
              {s.bring.length} {s.bring.length === 1 ? 'guest has' : 'guests have'}
            </strong>{' '}
            indicated that they will bring their monetary gift to the wedding.
          </p>
          <ul className="a-alert__list">
            {s.bring.slice(0, 5).map((g) => (
              <li key={g.id}>{bringMoneySentence(g)}</li>
            ))}
          </ul>
          <Link className="a-btn a-btn--sm" to="/admin/gifts?method=bring_to_wedding">
            View these guests
          </Link>
        </section>
      )}

      <div className="a-stats">
        {cards.map(([label, value, note]) => (
          <div className={`a-stat${label === 'Bring money to wedding' && s.bring.length ? ' a-stat--hot' : ''}`} key={label}>
            <span className="a-stat__value">{loading ? '…' : value}</span>
            <span className="a-stat__label">{label}</span>
            {note && <span className="a-stat__note">{note}</span>}
          </div>
        ))}
      </div>

      <section className="a-card">
        <h2>Gift preferences</h2>
        <div className="a-pref">
          <Link to="/admin/gifts?method=mobile_money" className="a-pref__row">
            <span>Mobile Money</span>
            <strong>{s.mobile}</strong>
          </Link>
          <Link to="/admin/gifts?method=bring_to_wedding" className="a-pref__row a-pref__row--hot">
            <span>Bring Money to Wedding</span>
            <strong>{s.bring.length}</strong>
          </Link>
        </div>
      </section>
    </>
  )
}
