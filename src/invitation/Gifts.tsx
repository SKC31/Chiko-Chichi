import { useState } from 'react'
import { useWedding } from '@/config/WeddingContext'
import { friendlyError } from '@/lib/errors'
import type { GiftMethod } from '@/lib/types'
import { submitGift } from '@/services/gifts'
import { useInvitation } from './InvitationContext'

const TBA = <em className="tba">to be added</em>

export function Gifts() {
  const c = useWedding()
  const mm = c.gifts.mobileMoney
  const { code, guest, setGuest } = useInvitation()

  const confirmed = guest.gift?.status === 'confirmed'
  const [choice, setChoice] = useState<GiftMethod | null>(guest.gift?.method ?? null)
  const [amount, setAmount] = useState(guest.gift?.amount ? String(guest.gift.amount) : '')
  const [phone, setPhone] = useState(guest.gift?.phone_number ?? '')
  const [reference, setReference] = useState(guest.gift?.transaction_reference ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<GiftMethod | null>(null)
  const [copied, setCopied] = useState(false)

  async function save(methodOverride?: GiftMethod) {
    const method = methodOverride ?? choice
    if (!method || busy) return
    setError('')

    let parsedAmount: number | null = null
    if (method === 'mobile_money' && amount.trim() !== '') {
      parsedAmount = Number(amount.replace(/,/g, ''))
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid amount, or leave it blank.')
        return
      }
    }
    if (method === 'mobile_money' && phone.trim() !== '' && !/^[0-9+ ()-]{7,20}$/.test(phone.trim())) {
      setError('Please enter a valid phone number, or leave it blank.')
      return
    }
    if (reference.length > 60) {
      setError('The reference is too long (60 characters at most).')
      return
    }

    setBusy(true)
    try {
      const next = await submitGift(code, {
        method,
        amount: parsedAmount,
        phone: method === 'mobile_money' ? phone : null,
        reference: method === 'mobile_money' ? reference : null,
      })
      setGuest(next)
      setSaved(method)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  function chooseMobileMoney() {
    setChoice('mobile_money')
    setSaved(null)
    setError('')
    // Register the choice right away; the fields below are optional extras
    // they can add afterward.
    save('mobile_money')
  }

  function chooseBringToWedding() {
    setChoice('bring_to_wedding')
    setSaved(null)
    setError('')
    // Nothing else to fill in for this option, so confirm right away.
    save('bring_to_wedding')
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(mm.number)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — the number is still visible to copy by hand */
    }
  }

  const alreadySaved = guest.gift && saved === null

  return (
    <section className="sec sec--olive gifts" aria-labelledby="gifts-title">
      <h2 className="sec__title" id="gifts-title">
        Gifts
      </h2>
      <p className="gifts__headline">{c.gifts.headline}</p>
      <p className="sec__intro">{c.gifts.message}</p>

      {confirmed ? (
        <p className="notice notice--ok" role="status">
          The couple have received your gift. Thank you for your generosity.
        </p>
      ) : (
        <>
          <div className="choice-row choice-row--stack" role="radiogroup" aria-label="How would you like to give?">
            <div className="choice-col">
              <button
                type="button"
                role="radio"
                aria-checked={choice === 'mobile_money'}
                className={`choice${choice === 'mobile_money' ? ' is-selected' : ''}`}
                onClick={chooseMobileMoney}
                disabled={busy}
              >
                Click here to pay via Mobile Money
              </button>

              {choice === 'mobile_money' && (
                <div className="panel">
                  <p className="panel__lead">Please send your gift before the wedding using these details:</p>
                  <dl className="details">
                    <div>
                      <dt>Provider</dt>
                      <dd>{mm.provider || TBA}</dd>
                    </div>
                    <div>
                      <dt>Number</dt>
                      <dd>
                        {mm.number || TBA}
                        {mm.number && (
                          <button type="button" className="link-btn link-btn--inline" onClick={copyNumber}>
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Account name</dt>
                      <dd>{mm.accountName || TBA}</dd>
                    </div>
                  </dl>
                  {mm.instructions && <p className="panel__note">{mm.instructions}</p>}

                  <p className="panel__lead panel__lead--sub">Optional — let the couple know it is on its way:</p>
                  <div className="field">
                    <label htmlFor="gift-amount">Amount sent</label>
                    <input
                      id="gift-amount"
                      inputMode="decimal"
                      autoComplete="off"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setSaved(null) }}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="gift-phone">Phone number you sent from</label>
                    <input
                      id="gift-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setSaved(null) }}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="gift-ref">Transaction reference</label>
                    <input
                      id="gift-ref"
                      maxLength={60}
                      autoComplete="off"
                      value={reference}
                      onChange={(e) => { setReference(e.target.value); setSaved(null) }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="choice-or" aria-hidden="true">Or</p>

            <div className="choice-col">
              <button
                type="button"
                role="radio"
                aria-checked={choice === 'bring_to_wedding'}
                className={`choice${choice === 'bring_to_wedding' ? ' is-selected' : ''}`}
                onClick={chooseBringToWedding}
                disabled={busy}
              >
                Click here to bring money to the wedding
              </button>

              {choice === 'bring_to_wedding' && !saved && (
                <div className="panel">
                  <p className="panel__lead">
                    Wonderful. We will let the couple know you will bring your monetary gift to the wedding.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}

          {choice === 'mobile_money' && (amount.trim() !== '' || phone.trim() !== '' || reference.trim() !== '') && (
            <button type="button" className="btn btn--primary" onClick={() => save()} disabled={busy}>
              {busy ? 'Saving…' : 'Save my gift note'}
            </button>
          )}

          {(saved || alreadySaved) && !error && (
            <p className="notice notice--ok" role="status">
              {(saved ?? guest.gift?.method) === 'mobile_money'
                ? 'Saved. Thank you — the couple will see that you are sending your gift by Mobile Money.'
                : 'Saved. Thank you — the couple will see that you are bringing your gift to the wedding.'}
            </p>
          )}
        </>
      )}
    </section>
  )
}
