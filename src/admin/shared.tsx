import { useCallback, useEffect, useState } from 'react'
import { defaultWedding } from '@/config/wedding'
import { formatLongDate } from '@/lib/datetime'
import { friendlyError } from '@/lib/errors'
import type { GuestRow, GuestWithGift } from '@/lib/types'

/** The full invitation URL for a guest. */
export function inviteUrl(code: string): string {
  const base = ((import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin).replace(/\/$/, '')
  return `${base}/invite/${code}`
}

/** Pre-filled WhatsApp text. Written from the couple's config, not hard-coded. */
export function whatsappText(guest: Pick<GuestRow, 'display_name' | 'invitation_code'>): string {
  const c = defaultWedding
  return (
    `Dear ${guest.display_name},\n\n` +
    `You are warmly invited to the wedding of ${c.groom} and ${c.bride} on ${formatLongDate(c)}.\n\n` +
    `Please open your personal invitation here:\n${inviteUrl(guest.invitation_code)}`
  )
}

export function useLoad<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fn())
      setError('')
    } catch (e) {
      setError(friendlyError(e, 'Could not load the data. Check your connection and that you are signed in as an administrator.'))
    } finally {
      setLoading(false)
    }
  }, [fn])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, loading, reload }
}

export function Badge({ tone, children }: { tone: 'ok' | 'warn' | 'bad' | 'muted' | 'gold'; children: React.ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export const rsvpBadge = (s: GuestRow['rsvp_status']) =>
  s === 'attending' ? <Badge tone="ok">Attending</Badge> : s === 'declined' ? <Badge tone="bad">Declined</Badge> : <Badge tone="muted">Pending</Badge>

export const inviteBadge = (s: GuestRow['invitation_status']) =>
  s === 'responded' ? (
    <Badge tone="ok">Responded</Badge>
  ) : s === 'opened' ? (
    <Badge tone="gold">Opened</Badge>
  ) : s === 'sent' ? (
    <Badge tone="warn">Sent</Badge>
  ) : (
    <Badge tone="muted">Not sent</Badge>
  )

export const giftLabel = (m: 'mobile_money' | 'bring_to_wedding') => (m === 'mobile_money' ? 'Mobile Money' : 'Bring Money to Wedding')

export function giftBadge(g: GuestWithGift['gift']) {
  if (!g) return <span className="muted">—</span>
  return g.method === 'bring_to_wedding' ? <Badge tone="gold">Bring to wedding</Badge> : <Badge tone="ok">Mobile Money</Badge>
}

/** "has/have indicated that they will…" — plural for couples and families. */
export function bringMoneySentence(g: Pick<GuestRow, 'display_name' | 'allowed_guests'>): string {
  const plural = g.allowed_guests > 1 || /&|\band\b|family/i.test(g.display_name)
  return `${g.display_name} ${plural ? 'have' : 'has'} indicated that they will bring their monetary gift to the wedding.`
}

export const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lusaka' }).format(new Date(iso))
    : '—'

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="a-alert a-alert--bad" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="a-btn a-btn--sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
