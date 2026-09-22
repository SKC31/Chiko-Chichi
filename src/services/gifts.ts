import { supabase } from '@/lib/supabase'
import type { GiftMethod, GuestState } from '@/lib/types'

export interface GiftSubmission {
  method: GiftMethod
  amount?: number | null
  phone?: string | null
  reference?: string | null
}

/** Records the guest's gift preference. No payment is processed. */
export async function submitGift(code: string, g: GiftSubmission): Promise<GuestState> {
  const { data, error } = await supabase.rpc('submit_gift', {
    p_code: code,
    p_method: g.method,
    p_amount: g.amount ?? null,
    p_phone: g.phone ?? null,
    p_reference: g.reference ?? null,
  })
  if (error) throw error
  return data as GuestState
}
