import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listGuests, listWishes } from '@/services/admin'
import { Modal } from './Modal'
import { CATEGORY_OPTIONS, ErrorBox, bringMoneySentence, useLoad } from './shared'

export function DashboardPage() {
  const guests = useLoad(listGuests)
  const wishes = useLoad(listWishes)
  const [showTotals, setShowTotals] = useState(false)

  const s = useMemo(() => {
    const active = (guests.data ?? []).filter((g) => g.is_active)
    const w = wishes.data ?? []
    const bring = active.filter((g) => g.gift?.method === 'bring_to_wedding')
    const blank = () => ({ invites: 0, seats: 0, responded: 0, attending: 0, attendees: 0, declined: 0, pending: 0, opened: 0 })
    const groups = [...CATEGORY_OPTIONS.map((o) => ({ key: o.value as string, label: o.label })), { key: 'none', label: 'Uncategorised' }]
    const byCat = Object.fromEntries(groups.map((x) => [x.key, blank()]))
    for (const g of active) {
      const r = byCat[g.category ?? 'none']
      r.invites += 1
      r.seats += g.allowed_guests || 1
      if (g.opened_at || g.invitation_status === 'opened' || g.invitation_status === 'responded') r.opened += 1
      if (g.rsvp_status !== 'pending') r.responded += 1
      if (g.rsvp_status === 'pending') r.pending += 1
      if (g.rsvp_status === 'declined') r.declined += 1
      if (g.rsvp_status === 'attending') {
        r.attending += 1
        r.attendees += g.attendee_count
      }
    }
    const catRows = groups.map((x) => ({ ...x, ...byCat[x.key] }))
    return {
      catRows,
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
        {cards.map(([label, value, note]) => {
          const isTotal = label === 'Total invitations'
          const cls = `a-stat${label === 'Bring money to wedding' && s.bring.length ? ' a-stat--hot' : ''}${isTotal ? ' a-stat--btn' : ''}`
          const inner = (
            <>
              <span className="a-stat__value">{loading ? '…' : value}</span>
              <span className="a-stat__label">{label}</span>
              {note && <span className="a-stat__note">{note}</span>}
              {isTotal && <span className="a-stat__note">View details</span>}
            </>
          )
          return isTotal ? (
            <button type="button" className={cls} key={label} aria-haspopup="dialog" onClick={() => setShowTotals(true)}>
              {inner}
            </button>
          ) : (
            <div className={cls} key={label}>
              {inner}
            </div>
          )
        })}
      </div>

      {showTotals && (
        <Modal wide labelledBy="total-details-title" onClose={() => setShowTotals(false)}>
          <section className="a-card" aria-label="Invitation details by category">
            <h2 id="total-details-title">Invitations by category</h2>
            <p className="a-hint">
              {s.invites} invitations covering {s.total} seats. Counts are for active invitations only. “Attending” shows invitations, with the number of people in brackets.
            </p>
            <div className="a-table-wrap a-table-wrap--scroll">
              <table className="a-table a-table--wide">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Invitations</th>
                    <th>Seats allowed</th>
                    <th>Opened</th>
                    <th>Responded</th>
                    <th>Attending</th>
                    <th>Declined</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {s.catRows.map((r) => (
                    <tr key={r.key}>
                      <td>
                        <strong>{r.label}</strong>
                      </td>
                      <td>{r.invites}</td>
                      <td>{r.seats}</td>
                      <td>{r.opened}</td>
                      <td>{r.responded}</td>
                      <td>
                        {r.attending} ({r.attendees})
                      </td>
                      <td>{r.declined}</td>
                      <td>{r.pending}</td>
                    </tr>
                  ))}
                  <tr className="a-table__total">
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>{s.invites}</strong>
                    </td>
                    <td>
                      <strong>{s.total}</strong>
                    </td>
                    <td>
                      <strong>{s.opened}</strong>
                    </td>
                    <td>
                      <strong>{s.responded}</strong>
                    </td>
                    <td>
                      <strong>
                        {s.attending} ({s.attendees})
                      </strong>
                    </td>
                    <td>
                      <strong>{s.declined}</strong>
                    </td>
                    <td>
                      <strong>{s.pending}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </Modal>
      )}

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
