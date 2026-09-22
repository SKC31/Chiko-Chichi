import { supabase } from '@/lib/supabase'
import type { GuestState } from '@/lib/types'

export async function submitRsvp(
  code: string,
  status: 'attending' | 'declined',
  attendeeCount: number | null,
): Promise<GuestState> {
  const { data, error } = await supabase.rpc('submit_rsvp', {
    p_code: code,
    p_status: status,
    p_attendee_count: attendeeCount,
  })
  if (error) throw error
  return data as GuestState
}
