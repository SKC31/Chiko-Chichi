import { createContext, useContext } from 'react'
import type { GuestState } from '@/lib/types'

interface InvitationApi {
  code: string
  guest: GuestState
  /** Replace the guest's state after a successful RSVP / gift submission. */
  setGuest: (g: GuestState) => void
}

export const InvitationContext = createContext<InvitationApi | null>(null)

export function useInvitation(): InvitationApi {
  const ctx = useContext(InvitationContext)
  if (!ctx) throw new Error('useInvitation must be used inside an invitation')
  return ctx
}
