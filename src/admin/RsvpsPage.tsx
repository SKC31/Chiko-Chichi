import { useMemo, useState } from 'react'
import type { RsvpStatus } from '@/lib/types'
import { listGuests } from '@/services/admin'
import { ErrorBox, fmtDate, inviteBadge, rsvpBadge, useLoad } from './shared'

type Filter = 'all' | RsvpStatus

export function RsvpsPage() {
  const { data, error, loading, reload } = useLoad(listGuests)
  const [filter, setFilter] = useState<Filter>('all')

  const active = useMemo(() => (data ?? []).filter((g) => g.is_active), [data])
  const counts = useMemo(
    () => ({
      all: active.length,
      attending: active.filter((g) => g.rsvp_status === 'attending').length,
      declined: active.filter((g) => g.rsvp_status === 'declined').length,
      pending: active.filter((g) => g.rsvp_status === 'pending').length,
    }),
    [active],
  )
  const people = active.reduce((n, g) => n + (g.rsvp_status === 'attending' ? g.attendee_count : 0), 0)
  const rows = filter === 'all' ? active : active.filter((g) => g.rsvp_status === filter)

  const tabs: [Filter, string][] = [
    ['all', 'All'],
    ['attending', 'Attending'],
    ['declined', 'Declined'],
    ['pending', 'Pending'],
  ]

  return (
    <>
      <div className="a-head">
        <h1>RSVPs</h1>
        <p className="muted">{people} people confirmed</p>
      </div>
      {error && <ErrorBox message={error} onRetry={() => void reload()} />}

      <div className="a-tabs" role="tablist" aria-label="Filter RSVPs">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={filter === key} className={`a-tab${filter === key ? ' is-active' : ''}`} onClick={() => setFilter(key)}>
            {label} <span className="a-tab__count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="a-table-wrap">
        <table className="a-table a-table--cards">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Invitation</th>
              <th>RSVP</th>
              <th>Attendee count</th>
              <th>Replied</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id}>
                <td data-label="Guest">
                  <strong>{g.display_name}</strong>
                </td>
                <td data-label="Invitation">{inviteBadge(g.invitation_status)}</td>
                <td data-label="RSVP">{rsvpBadge(g.rsvp_status)}</td>
                <td data-label="Attendee count">{g.rsvp_status === 'attending' ? `${g.attendee_count} of ${g.allowed_guests}` : '—'}</td>
                <td data-label="Replied">{fmtDate(g.responded_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <p className="a-empty">Nobody in this list yet.</p>}
        {loading && !data && <p className="a-empty">Loading…</p>}
      </div>
    </>
  )
}
