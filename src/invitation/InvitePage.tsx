import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { WeddingContext } from '@/config/WeddingContext'
import { defaultWedding, mergeConfig, type WeddingConfig } from '@/config/wedding'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { GuestState } from '@/lib/types'
import { MusicButton } from '@/music/MusicButton'
import { useMusic } from '@/music/MusicProvider'
import { getInvitation, markOpened } from '@/services/invitations'
import { Countdown } from './Countdown'
import { Cover } from './Cover'
import { DressCode } from './DressCode'
import { Footer } from './Footer'
import { Gallery } from './Gallery'
import { Gifts } from './Gifts'
import { Greeting } from './Greeting'
import { Hero } from './Hero'
import { InvitationContext } from './InvitationContext'
import { Programme } from './Programme'
import { Rsvp } from './Rsvp'
import { Wishes } from './Wishes'
import { Message } from '@/components/Message'

type Load =
  | { s: 'loading' }
  | { s: 'invalid' }
  | { s: 'error' }
  | { s: 'ready'; guest: GuestState; config: WeddingConfig }

const OPEN_MS = 1700

export default function InvitePage() {
  const { code = '' } = useParams()
  const music = useMusic()
  const [load, setLoad] = useState<Load>({ s: 'loading' })
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed')
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let alive = true
    if (!isSupabaseConfigured) {
      setLoad({ s: 'error' })
      return
    }
    setLoad({ s: 'loading' })
    getInvitation(code)
      .then((data) => {
        if (!alive) return
        if (!data) setLoad({ s: 'invalid' })
        else setLoad({ s: 'ready', guest: data.guest, config: mergeConfig(defaultWedding, data.settings) })
      })
      .catch(() => alive && setLoad({ s: 'error' }))
    return () => {
      alive = false
    }
  }, [code])

  // Lock page scroll behind the cover
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('is-locked', phase !== 'open')
    return () => root.classList.remove('is-locked')
  }, [phase])

  const config = load.s === 'ready' ? load.config : defaultWedding

  const handleOpen = useCallback(() => {
    if (load.s !== 'ready' || phase !== 'closed') return
    music.start(load.config.music.src) // must run synchronously inside the click
    void markOpened(code)
    setPhase('opening')
    window.setTimeout(() => {
      setPhase('open')
      mainRef.current?.focus({ preventScroll: true })
    }, OPEN_MS)
  }, [load, phase, music, code])

  const setGuest = useCallback((guest: GuestState) => {
    setLoad((prev) => (prev.s === 'ready' ? { ...prev, guest } : prev))
  }, [])

  if (load.s === 'invalid') {
    return (
      <Message
        title="This invitation link isn’t valid"
        text="Please check the link you were sent, or contact the couple for a new one."
      />
    )
  }
  if (load.s === 'error') {
    return (
      <Message
        title="We couldn’t load your invitation"
        text={
          isSupabaseConfigured
            ? 'Please check your internet connection and try again.'
            : 'The site is not connected to its database yet (missing Supabase settings).'
        }
        action={isSupabaseConfigured ? { label: 'Try again', onClick: () => window.location.reload() } : undefined}
      />
    )
  }

  return (
    <WeddingContext.Provider value={config}>
      {load.s === 'ready' && (
        <InvitationContext.Provider value={{ code, guest: load.guest, setGuest }}>
          <div className="stage">
            <main className="page" ref={mainRef} tabIndex={-1} inert={phase === 'closed'}>
              <Hero />
              <Greeting />
              <Countdown />
              <Programme />
              <DressCode />
              <Gallery />
              <Gifts />
              <Rsvp />
              <Wishes />
              <Footer />
            </main>
          </div>
        </InvitationContext.Provider>
      )}

      {phase !== 'open' && (
        <Cover
          phase={phase === 'opening' ? 'opening' : 'closed'}
          guestName={load.s === 'ready' ? load.guest.display_name : undefined}
          ready={load.s === 'ready'}
          onOpen={handleOpen}
        />
      )}

      <MusicButton />
    </WeddingContext.Provider>
  )
}
