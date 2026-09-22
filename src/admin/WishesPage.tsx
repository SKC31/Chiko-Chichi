import { useMemo, useState } from 'react'
import type { WishStatus } from '@/lib/types'
import { deleteWish, listWishes, setWishStatus } from '@/services/admin'
import { Badge, ErrorBox, fmtDate, useLoad } from './shared'

type Filter = 'pending' | 'approved' | 'rejected' | 'all'

export function WishesPage() {
  const { data, error, loading, reload } = useLoad(listWishes)
  const [filter, setFilter] = useState<Filter>('pending')
  const [actionError, setActionError] = useState('')

  const all = data ?? []
  const counts = useMemo(
    () => ({
      pending: all.filter((w) => w.status === 'pending').length,
      approved: all.filter((w) => w.status === 'approved').length,
      rejected: all.filter((w) => w.status === 'rejected').length,
      all: all.length,
    }),
    [all],
  )
  const rows = filter === 'all' ? all : all.filter((w) => w.status === filter)

  async function run(fn: () => Promise<void>) {
    setActionError('')
    try {
      await fn()
      await reload()
    } catch {
      setActionError('That action failed. Please try again.')
    }
  }

  const tabs: [Filter, string][] = [
    ['pending', 'Awaiting approval'],
    ['approved', 'Approved'],
    ['rejected', 'Rejected'],
    ['all', 'All'],
  ]
  const tone = (s: WishStatus) => (s === 'approved' ? 'ok' : s === 'rejected' ? 'bad' : 'warn')

  return (
    <>
      <div className="a-head">
        <h1>Wishes</h1>
        <p className="muted">Only approved wishes appear on the invitation.</p>
      </div>
      {error && <ErrorBox message={error} onRetry={() => void reload()} />}
      {actionError && <ErrorBox message={actionError} />}

      <div className="a-tabs" role="tablist" aria-label="Filter wishes">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={filter === key} className={`a-tab${filter === key ? ' is-active' : ''}`} onClick={() => setFilter(key)}>
            {label} <span className="a-tab__count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <ul className="a-wishes">
        {rows.map((w) => (
          <li key={w.id} className="a-card a-wish">
            <p className="a-wish__text">{w.message}</p>
            <p className="muted">
              {w.guest_name} · {fmtDate(w.created_at)} · <Badge tone={tone(w.status)}>{w.status}</Badge>
            </p>
            <div className="a-actions">
              {w.status !== 'approved' && (
                <button className="a-btn a-btn--sm a-btn--primary" onClick={() => void run(() => setWishStatus(w.id, 'approved'))}>
                  Approve
                </button>
              )}
              {w.status !== 'rejected' && (
                <button className="a-btn a-btn--sm" onClick={() => void run(() => setWishStatus(w.id, 'rejected'))}>
                  Reject
                </button>
              )}
              <button
                className="a-btn a-btn--sm a-btn--danger"
                onClick={() => {
                  if (window.confirm('Delete this wish permanently?')) void run(() => deleteWish(w.id))
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && rows.length === 0 && <p className="a-empty">Nothing here.</p>}
      {loading && !data && <p className="a-empty">Loading…</p>}
    </>
  )
}
