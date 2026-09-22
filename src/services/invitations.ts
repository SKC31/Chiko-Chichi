import { supabase } from '@/lib/supabase'
import type { InvitationPayload } from '@/lib/types'

/** Looks up the guest for an invitation code. Returns null when the code is unknown or deactivated. */
export async function getInvitation(code: string): Promise<InvitationPayload | null> {
  const { data, error } = await supabase.rpc('get_invitation', { p_code: code })
  if (error) throw error
  return (data as InvitationPayload | null) ?? null
}

/** Records that the guest opened their invitation. Failure is silent — it must never block the guest. */
export async function markOpened(code: string): Promise<void> {
  try {
    await supabase.rpc('mark_opened', { p_code: code })
  } catch {
    /* ignore */
  }
}
