import { supabase } from '@/lib/supabase'
import type { PublicWish } from '@/lib/types'

export async function submitWish(code: string, message: string): Promise<void> {
  const { error } = await supabase.rpc('submit_wish', { p_code: code, p_message: message })
  if (error) throw error
}

/** Approved wishes only — enforced in the database, not here. */
export async function getPublicWishes(): Promise<PublicWish[]> {
  const { data, error } = await supabase.rpc('get_public_wishes', { p_limit: 50 })
  if (error) throw error
  return (data as PublicWish[]) ?? []
}
