import { useState } from 'react'
import { whatsAppLink } from '@/lib/phone'
import type { GuestRow } from '@/lib/types'
import { markInvitationSent } from '@/services/admin'
import { inviteUrl, whatsappText } from './shared'

interface Props {
  guest: GuestRow
  onDone: () => void
  onSentMarked: () => void
}

/** Shown right after a guest is created: the personalised link + copy / WhatsApp actions. */
export function InviteLinkPanel({ guest, onDone, onSentMarked }: Props) {
  const url = inviteUrl(guest.invitation_code)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this invitation link:', url)
    }
  }

  return (
    <section className="a-card a-card--success" aria-live="polite">
      <h2>Personalized invitation</h2>
      <p>
        Created for <strong>{guest.display_name}</strong> · code <code>{guest.invitation_code}</code>
      </p>
      <p className="a-link">{url}</p>
      <div className="a-actions">
        <button className="a-btn a-btn--primary" onClick={copy}>
          {copied ? 'Copied!' : 'Copy invitation link'}
        </button>
        <a
          className="a-btn"
          href={whatsAppLink(guest.phone, whatsappText(guest))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void markInvitationSent(guest.id).then(onSentMarked)}
        >
          Send via WhatsApp
        </a>
        <button className="a-btn a-btn--ghost" onClick={onDone}>
          Done
        </button>
      </div>
      {!guest.phone && <p className="a-hint">No phone number saved — WhatsApp will let you choose the contact.</p>}
    </section>
  )
}
