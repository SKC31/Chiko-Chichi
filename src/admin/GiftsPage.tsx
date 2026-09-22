import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GiftMethod } from '@/lib/types'
import { listGuests, setGiftStatus } from '@/services/admin'
import { ErrorBox, bringMoneySentence, fmtDate, giftLabel, rsvpBadge, useLoad, Badge } from './shared'

export function GiftsPage() {
  const { data, error, loading, reload } = useLoad(listGuests)
  const [params, setParams] = useSearchParams()
  const method: GiftMethod = params.get('method') === 'mobile_money' ? 'mobile_money' : 'bring_to_wedding'
  const [actionError, setActionError] = useState('')

  const withGift = useMemo(() => (data ?? []).filter((g) => g.is_active && g.gift), [data])
  const bring = withGift.filter((g) => g.gift!.method === 'bring_to_wedding')
  const mobile = withGift.filter((g) => g.gift!.method === 'mobile_money')
  const rows = method === 'bring_to_wedding' ? bring : mobile
  const noPreference = (data ?? []).filter((g) => g.is_active && !g.gift).length

  async function toggle(giftId: string, to: 'pending' | 'confirmed') {
    setActionError('')
    try {
      await setGiftStatus(giftId, to)
      await reload()
    } catch {
      setActionError('Could not update the gift status. Please try again.')
    }
  }

  return (
    <>
      <div className="a-head">
        <h1>Gifts</h1>
        <p className="muted">{noPreference} guests have not chosen yet</p>
      </div>
      <p className="a-hint">
        Guests only tell you how they plan to give — no money moves through this site. Mark a gift “Received” once you have checked it.
      </p>

      {bring.length > 0 && (
        <section className="a-alert a-alert--gold">
          <p>
            <span role="img" aria-label="Notification">
              🔔
            </span>{' '}
            <strong>{bring.length}</strong> {bring.length === 1 ? 'guest has' : 'guests have'} indicated that they will bring their monetary gift to the wedding.
          </p>
        </section>
      )}
      {error && <ErrorBox message={error} onRetry={() => void reload()} />}
      {actionError && <ErrorBox message={actionError} />}

      <div className="a-tabs" role="tablist" aria-label="Gift method">
        <button role="tab" aria-selected={method === 'bring_to_wedding'} className={`a-tab${method === 'bring_to_wedding' ? ' is-active' : ''}`} onClick={() => setParams({ method: 'bring_to_wedding' })}>
          Bring Money to Wedding <span className="a-tab__count">{bring.length}</span>
        </button>
        <button role="tab" aria-selected={method === 'mobile_money'} className={`a-tab${method === 'mobile_money' ? ' is-active' : ''}`} onClick={() => setParams({ method: 'mobile_money' })}>
          Mobile Money <span className="a-tab__count">{mobile.length}</span>
        </button>
      </div>

      {method === 'bring_to_wedding' && bring.length > 0 && (
        <ul className="a-sentences">
          {bring.map((g) => (
            <li key={g.id}>{bringMoneySentence(g)}</li>
          ))}
        </ul>
      )}

      <div className="a-table-wrap">
        <table className="a-table a-table--cards">
          <thead>
            <tr>
              <th>Guest</th>
              <th>RSVP</th>
              <th>Gift</th>
              {method === 'mobile_money' && (
                <>
                  <th>Amount</th>
                  <th>Phone</th>
                  <th>Reference</th>
                </>
              )}
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => {
              const gift = g.gift!
              return (
                <tr key={g.id}>
                  <td data-label="Guest">
                    <strong>{g.display_name}</strong>
                  </td>
                  <td data-label="RSVP">{rsvpBadge(g.rsvp_status)}</td>
                  <td data-label="Gift">{giftLabel(gift.method)}</td>
                  {method === 'mobile_money' && (
                    <>
                      <td data-label="Amount">{gift.amount ?? '—'}</td>
                      <td data-label="Phone">{gift.phone_number ?? '—'}</td>
                      <td data-label="Reference">{gift.transaction_reference ?? '—'}</td>
                    </>
                  )}
                  <td data-label="Status">
                    {gift.status === 'confirmed' ? <Badge tone="ok">Received</Badge> : <Badge tone="warn">Awaiting</Badge>}{' '}
                    <button className="a-btn a-btn--sm a-btn--ghost" onClick={() => void toggle(gift.id, gift.status === 'confirmed' ? 'pending' : 'confirmed')}>
                      {gift.status === 'confirmed' ? 'Undo' : 'Mark received'}
                    </button>
                  </td>
                  <td data-label="Updated">{fmtDate(gift.updated_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <p className="a-empty">No guests have chosen this option yet.</p>}
        {loading && !data && <p className="a-empty">Loading…</p>}
      </div>
    </>
  )
}
