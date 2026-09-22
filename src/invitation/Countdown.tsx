import { useWedding } from '@/config/WeddingContext'
import { getCalendar, getCountdown } from '@/lib/datetime'
import { useNow } from '@/lib/hooks'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const pad = (n: number) => String(n).padStart(2, '0')

export function Countdown() {
  const c = useWedding()
  const now = useNow(1000)
  const cd = getCountdown(c, now)
  const cal = getCalendar(c)

  return (
    <section className="sec sec--olive countdown" aria-labelledby="countdown-title">
      <h2 className="sec__title" id="countdown-title">
        {cd.phase === 'before' ? 'Counting down to our day' : cd.phase === 'today' ? 'Today is the day' : 'Thank you'}
      </h2>

      {cd.phase === 'before' ? (
        <div className="countdown__grid" role="timer" aria-label={`${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes and ${cd.seconds} seconds to go`}>
          {(
            [
              ['Days', cd.days],
              ['Hours', pad(cd.hours)],
              ['Minutes', pad(cd.minutes)],
              ['Seconds', pad(cd.seconds)],
            ] as const
          ).map(([label, value]) => (
            <div className="countdown__cell" key={label}>
              <span className="countdown__num">{value}</span>
              <span className="countdown__label">{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="countdown__done">
          {cd.phase === 'today'
            ? `Today we celebrate the wedding of ${c.groom.split(' ')[0]} and ${c.bride.split(' ')[0]}.`
            : 'Thank you for celebrating our wedding with us.'}
        </p>
      )}

      <div className="calendar" role="img" aria-label={`Calendar for ${cal.title}, highlighting day ${cal.highlight}`}>
        <p className="calendar__title">{cal.title}</p>
        <div className="calendar__grid" aria-hidden="true">
          {WEEKDAYS.map((d) => (
            <span key={d} className="calendar__dow">
              {d}
            </span>
          ))}
          {cal.cells.map((day, i) => (
            <span key={i} className={`calendar__day${day === cal.highlight ? ' is-hit' : ''}`}>
              {day ?? ''}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
