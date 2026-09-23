import { useMemo, useState } from 'react'
import { whatsAppLink } from '@/lib/phone'
import type { GuestRow, GuestWithGift } from '@/lib/types'
import { deleteGuest, listGuests, markInvitationSent, setGuestActive } from '@/services/admin'
import { GuestForm } from './GuestForm'
import { InviteLinkPanel } from './InviteLinkPanel'
import { Modal } from './Modal'
import { Badge, ErrorBox, giftBadge, inviteBadge, inviteUrl, rsvpBadge, useLoad, whatsappText } from './shared'

type Mode = { kind: 'none' } | { kind: 'create' } | { kind: 'edit'; guest: GuestRow } | { kind: 'created'; guest: GuestRow }

export function GuestsPage() {
  const { data, error, loading, reload } = useLoad(listGuests)
  const [q, setQ] = useState('')
  const [mode, setMode] = useState<Mode>({ kind: 'none' })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    const all = data ?? []
    if (!term) return all
    return all.filter((g) =>
      [g.display_name, g.first_name, g.last_name, g.phone, g.email, g.invitation_code].some((v) => v?.toLowerCase().includes(term)),
    )
  }, [data, q])

  async function run(fn: () => Promise<void>) {
    setActionError('')
    try {
      await fn()
      await reload()
    } catch {
      setActionError('That action failed. Please try again.')
    }
  }

  async function copy(g: GuestWithGift) {
    const url = inviteUrl(g.invitation_code)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(g.id)
      window.setTimeout(() => setCopiedId(null), 1800)
    } catch {
      window.prompt('Copy this invitation link:', url)
    }
  }

  return (
    <>
      <div className="a-head">
        <h1>Guests</h1>
        <button className="a-btn a-btn--primary" onClick={() => setMode({ kind: 'create' })}>
          Add guest
        </button>
      </div>

      {mode.kind === 'create' && (
        <GuestForm
          onCancel={() => setMode({ kind: 'none' })}
          onSaved={(guest) => {
            setMode({ kind: 'created', guest })
            void reload()
          }}
        />
      )}
      {mode.kind === 'edit' && (
        <Modal labelledBy="guest-form-title" onClose={() => setMode({ kind: 'none' })}>
          <GuestForm
            guest={mode.guest}
            onCancel={() => setMode({ kind: 'none' })}
            onSaved={() => {
              setMode({ kind: 'none' })
              void reload()
            }}
          />
        </Modal>
      )}
      {mode.kind === 'created' && (
        <InviteLinkPanel guest={mode.guest} onDone={() => setMode({ kind: 'none' })} onSentMarked={() => void reload()} />
      )}

      <div className="a-field a-search">
        <label htmlFor="g-search" className="sr-only">
          Search guests
        </label>
        <input id="g-search" type="search" placeholder="Search by name, phone, email or code" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <ErrorBox message={error} onRetry={() => void reload()} />}
      {actionError && <ErrorBox message={actionError} />}

      <div className="a-table-wrap">
        <table className="a-table a-table--cards">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Code</th>
              <th>Invitation</th>
              <th>RSVP</th>
              <th>Gift</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id} className={g.is_active ? '' : 'is-inactive'}>
                <td data-label="Guest">
                  <strong>{g.display_name}</strong>
                  {!g.is_active && <Badge tone="muted">Deactivated</Badge>}
                  <div className="muted">{g.phone || g.email || 'No contact saved'}</div>
                </td>
                <td data-label="Code">
                  <code>{g.invitation_code}</code>
                </td>
                <td data-label="Invitation">{inviteBadge(g.invitation_status)}</td>
                <td data-label="RSVP">
                  {rsvpBadge(g.rsvp_status)}
                  <div className="muted">
                    {g.rsvp_status === 'attending' ? `${g.attendee_count} of ${g.allowed_guests}` : `Up to ${g.allowed_guests}`}
                  </div>
                </td>
                <td data-label="Gift">{giftBadge(g.gift)}</td>
                <td data-label="Actions">
                  <div className="a-rowactions">
                    <button className="a-btn a-btn--sm" onClick={() => void copy(g)}>
                      {copiedId === g.id ? 'Copied' : 'Copy link'}
                    </button>
                    <a
                      className="a-btn a-btn--sm"
                      href={whatsAppLink(g.phone, whatsappText(g))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => void run(() => markInvitationSent(g.id))}
                    >
                      WhatsApp
                    </a>
                    {g.invitation_status === 'pending' && (
                      <button className="a-btn a-btn--sm a-btn--ghost" onClick={() => void run(() => markInvitationSent(g.id))}>
                        Mark sent
                      </button>
                    )}
                    <button className="a-btn a-btn--sm a-btn--ghost" onClick={() => setMode({ kind: 'edit', guest: g })}>
                      Edit
                    </button>
                    <button className="a-btn a-btn--sm a-btn--ghost" onClick={() => void run(() => setGuestActive(g.id, !g.is_active))}>
                      {g.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button
                      className="a-btn a-btn--sm a-btn--danger"
                      onClick={() => {
                        if (window.confirm(`Delete ${g.display_name}? This also deletes their RSVP, gift note and wishes. This cannot be undone.`))
                          void run(() => deleteGuest(g.id))
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <p className="a-empty">{data && data.length > 0 ? 'No guests match your search.' : 'No guests yet. Choose “Add guest” to create the first invitation.'}</p>
        )}
        {loading && !data && <p className="a-empty">Loading guests…</p>}
      </div>
    </>
  )
}
