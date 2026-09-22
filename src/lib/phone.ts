/**
 * Turn a phone number into WhatsApp's international format (digits only).
 * Numbers starting with a single 0 are assumed to be Zambian (+260).
 */
export function toWhatsAppNumber(phone: string | null | undefined, defaultCountryCode = '260'): string {
  if (!phone) return ''
  let digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits.slice(1).replace(/\D/g, '')
  digits = digits.replace(/\D/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0')) return defaultCountryCode + digits.slice(1)
  return digits
}

export function whatsAppLink(phone: string | null | undefined, message: string): string {
  const n = toWhatsAppNumber(phone)
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}
