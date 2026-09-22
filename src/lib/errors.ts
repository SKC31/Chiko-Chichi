/** Turns server error codes (raised by the database functions) into friendly sentences. */
const MESSAGES: Record<string, string> = {
  invalid_code: 'This invitation link is no longer valid. Please contact the couple.',
  invalid_status: 'Please choose whether you will attend.',
  invalid_attendee_count: 'The number of guests is more than your invitation allows.',
  invalid_method: 'Please choose how you would like to give.',
  invalid_amount: 'Please enter a valid amount, or leave it blank.',
  invalid_phone: 'Please enter a valid phone number, or leave it blank.',
  invalid_reference: 'The reference is too long (60 characters at most).',
  invalid_message: 'Please write a message between 2 and 500 characters.',
  too_many_wishes: 'You have already sent the maximum number of wishes. Thank you!',
  duplicate_wish: 'You have already sent this exact wish. Thank you!',
  gift_already_confirmed: 'The couple have already confirmed your gift, so it can no longer be changed.',
  display_name_required: 'Please enter a name for this guest.',
}

export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw =
    typeof err === 'string' ? err : err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : ''
  for (const code of Object.keys(MESSAGES)) if (raw.includes(code)) return MESSAGES[code]
  if (/failed to fetch|network|load failed/i.test(raw)) return 'We could not reach the server. Please check your connection and try again.'
  return fallback
}
