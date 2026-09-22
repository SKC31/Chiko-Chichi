import { supabase } from '@/lib/supabase'
import type { GiftRow, GuestInput, GuestRow, GuestWithGift, WishRow, WishStatus } from '@/lib/types'

/** Every guest with their gift preference (if any). Access is enforced by RLS: admins only. */
export async function listGuests(): Promise<GuestWithGift[]> {
  const [guests, gifts] = await Promise.all([
    supabase.from('guests').select('*').order('created_at', { ascending: false }),
    supabase.from('gift_contributions').select('*'),
  ])
  if (guests.error) throw guests.error
  if (gifts.error) throw gifts.error
  const byGuest = new Map<string, GiftRow>((gifts.data as GiftRow[]).map((g) => [g.guest_id, g]))
  return (guests.data as GuestRow[]).map((g) => ({ ...g, gift: byGuest.get(g.id) ?? null }))
}

const clean = (v: string) => (v.trim() === '' ? null : v.trim())

export async function createGuest(input: GuestInput): Promise<GuestRow> {
  const { data, error } = await supabase
    .from('guests')
    .insert({
      title: clean(input.title),
      first_name: clean(input.first_name),
      last_name: clean(input.last_name),
      display_name: input.display_name.trim(),
      phone: clean(input.phone),
      email: clean(input.email),
      allowed_guests: input.allowed_guests,
    })
    .select()
    .single()
  if (error) throw error
  return data as GuestRow
}

export async function updateGuest(id: string, input: GuestInput): Promise<GuestRow> {
  const { data, error } = await supabase
    .from('guests')
    .update({
      title: clean(input.title),
      first_name: clean(input.first_name),
      last_name: clean(input.last_name),
      display_name: input.display_name.trim(),
      phone: clean(input.phone),
      email: clean(input.email),
      allowed_guests: input.allowed_guests,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as GuestRow
}

export async function setGuestActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('guests').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

/** Only moves pending → sent, so it never overwrites "opened" or "responded". */
export async function markInvitationSent(id: string): Promise<void> {
  const { error } = await supabase
    .from('guests')
    .update({ invitation_status: 'sent' })
    .eq('id', id)
    .eq('invitation_status', 'pending')
  if (error) throw error
}

export async function deleteGuest(id: string): Promise<void> {
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) throw error
}

export async function setGiftStatus(giftId: string, status: 'pending' | 'confirmed'): Promise<void> {
  const { error } = await supabase.from('gift_contributions').update({ status }).eq('id', giftId)
  if (error) throw error
}

export async function listWishes(): Promise<WishRow[]> {
  const { data, error } = await supabase
    .from('wishes')
    .select('id, guest_id, message, status, approved, created_at, guests(display_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  type Raw = Omit<WishRow, 'guest_name'> & { guests: { display_name: string } | { display_name: string }[] | null }
  return (data as unknown as Raw[]).map(({ guests, ...w }) => {
    const g = Array.isArray(guests) ? guests[0] : guests
    return { ...w, guest_name: g?.display_name ?? 'Unknown guest' }
  })
}

export async function setWishStatus(id: string, status: WishStatus): Promise<void> {
  const { error } = await supabase.from('wishes').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteWish(id: string): Promise<void> {
  const { error } = await supabase.from('wishes').delete().eq('id', id)
  if (error) throw error
}
