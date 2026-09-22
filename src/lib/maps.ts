import type { Venue } from '@/config/wedding'

const enc = encodeURIComponent

/**
 * "View location" link. Uses the exact Google Maps link if one was configured;
 * otherwise falls back to a Google Maps *search* for the venue name.
 * No coordinates are ever invented.
 */
export function venueViewUrl(v: Venue): string {
  if (v.mapUrl) return v.mapUrl
  return `https://www.google.com/maps/search/?api=1&query=${enc([v.name, v.location].filter(Boolean).join(', '))}`
}

export function venueDirectionsUrl(v: Venue): string {
  if (v.directionsUrl) return v.directionsUrl
  return `https://www.google.com/maps/dir/?api=1&destination=${enc([v.name, v.location].filter(Boolean).join(', '))}`
}
