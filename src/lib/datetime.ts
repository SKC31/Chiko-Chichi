import type { WeddingConfig } from '@/config/wedding'

/** The moment the countdown runs to, in the wedding's own time zone (CAT). */
export function weddingInstant(c: WeddingConfig): Date {
  return new Date(`${c.weddingDate}T${c.countdownTime}:00${c.utcOffset}`)
}

/** The last second of the wedding day, in the wedding's own time zone. */
export function endOfWeddingDay(c: WeddingConfig): Date {
  return new Date(`${c.weddingDate}T23:59:59${c.utcOffset}`)
}

const noonOf = (c: WeddingConfig) => new Date(`${c.weddingDate}T12:00:00${c.utcOffset}`)

export function formatLongDate(c: WeddingConfig): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: c.timezone,
  }).format(noonOf(c))
}

export function formatWeekday(c: WeddingConfig): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: c.timezone }).format(noonOf(c))
}

/** "09:00" → "09:00 hrs" */
export const formatTime = (t: string) => `${t} hrs`

export type CountdownPhase = 'before' | 'today' | 'after'

export interface CountdownState {
  phase: CountdownPhase
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Never returns negative values: once the time has passed the phase changes instead. */
export function getCountdown(c: WeddingConfig, now: number = Date.now()): CountdownState {
  const target = weddingInstant(c).getTime()
  const diff = target - now
  if (diff <= 0) {
    const phase: CountdownPhase = now <= endOfWeddingDay(c).getTime() ? 'today' : 'after'
    return { phase, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const total = Math.floor(diff / 1000)
  return {
    phase: 'before',
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export interface CalendarMonth {
  title: string
  /** Monday-first grid; null = empty cell */
  cells: (number | null)[]
  highlight: number
}

export function getCalendar(c: WeddingConfig): CalendarMonth {
  const [y, m, d] = c.weddingDate.split('-').map(Number)
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay() // 0 = Sunday
  const offset = (firstDow + 6) % 7
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const cells: (number | null)[] = Array(offset).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  const title = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  )
  return { title, cells, highlight: d }
}
