import { Rosette } from '@/components/ornaments/Ornaments'
import { useWedding } from '@/config/WeddingContext'
import type { Venue } from '@/config/wedding'
import { formatTime } from '@/lib/datetime'
import { venueDirectionsUrl, venueViewUrl } from '@/lib/maps'

interface Item {
  time: string
  label: string
  place?: string
  venue?: Venue
}

function VenueLinks({ venue }: { venue: Venue }) {
  return (
    <div className="programme__links">
      <a className="btn btn--ghost btn--sm" href={venueViewUrl(venue)} target="_blank" rel="noopener noreferrer">
        View location
      </a>
      <a className="btn btn--ghost btn--sm" href={venueDirectionsUrl(venue)} target="_blank" rel="noopener noreferrer">
        Get directions
      </a>
    </div>
  )
}

export function Programme() {
  const c = useWedding()
  const items: Item[] = [
    { time: c.church.time, label: 'Church', place: c.church.name, venue: c.church },
    
    {
      time: c.reception.time,
      label: 'Reception',
      place: [c.reception.name, c.reception.location].filter(Boolean).join(', '),
      venue: c.reception,
    },
  ]

  return (
    <section className="sec sec--black programme" aria-labelledby="programme-title">
      <h2 className="sec__title" id="programme-title">
        Wedding Programme
      </h2>
      <ol className="programme__list">
        {items.map((it) => (
          <li className="programme__item" key={it.label}>
            <Rosette size={30} className="programme__node" />
            <p className="programme__time">{formatTime(it.time)}</p>
            <h3 className="programme__label">{it.label}</h3>
            {it.place && <p className="programme__place">{it.place}</p>}
            {it.venue && <VenueLinks venue={it.venue} />}
          </li>
        ))}
      </ol>
    </section>
  )
}
