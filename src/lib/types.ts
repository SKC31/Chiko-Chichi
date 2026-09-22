export type RsvpStatus = 'pending' | 'attending' | 'declined'
export type InvitationStatus = 'pending' | 'sent' | 'opened' | 'responded'
export type GiftMethod = 'mobile_money' | 'bring_to_wedding'
export type GiftStatus = 'pending' | 'confirmed'
export type WishStatus = 'pending' | 'approved' | 'rejected'

/** What a guest may know about their own invitation (no phone / email / code). */
export interface GuestGift {
  method: GiftMethod
  amount: number | null
  phone_number: string | null
  transaction_reference: string | null
  status: GiftStatus
}

export interface GuestState {
  display_name: string
  title: string | null
  allowed_guests: number
  attendee_count: number
  rsvp_status: RsvpStatus
  invitation_status: InvitationStatus
  gift: GuestGift | null
  unchanged?: boolean
}

export interface InvitationPayload {
  guest: GuestState
  settings: Record<string, unknown>
}

export interface PublicWish {
  id: string
  author: string
  message: string
  created_at: string
}

// ---- Admin-side rows -------------------------------------------------

export interface GuestRow {
  id: string
  invitation_code: string
  title: string | null
  first_name: string | null
  last_name: string | null
  display_name: string
  phone: string | null
  email: string | null
  allowed_guests: number
  attendee_count: number
  rsvp_status: RsvpStatus
  invitation_status: InvitationStatus
  is_active: boolean
  opened_at: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

export interface GiftRow {
  id: string
  guest_id: string
  method: GiftMethod
  amount: number | null
  phone_number: string | null
  transaction_reference: string | null
  status: GiftStatus
  created_at: string
  updated_at: string
}

export interface GuestWithGift extends GuestRow {
  gift: GiftRow | null
}

export interface WishRow {
  id: string
  guest_id: string
  message: string
  status: WishStatus
  approved: boolean
  created_at: string
  guest_name: string
}

export interface GuestInput {
  title: string
  first_name: string
  last_name: string
  display_name: string
  phone: string
  email: string
  allowed_guests: number
}
