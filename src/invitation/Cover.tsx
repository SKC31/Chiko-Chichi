import { CornerOrnament, Flourish } from '@/components/ornaments/Ornaments'
import { useWedding } from '@/config/WeddingContext'
import { formatLongDate } from '@/lib/datetime'

/** Deterministic sparkle positions so the cover looks the same on every load. */
const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37 + 11) % 97}%`,
  top: `${(i * 53 + 7) % 93}%`,
  size: 2 + ((i * 5) % 4),
  delay: `${(i % 7) * 0.7}s`,
  dur: `${5 + (i % 5)}s`,
}))

interface Props {
  phase: 'closed' | 'opening'
  guestName?: string
  ready: boolean
  onOpen: () => void
}

export function Cover({ phase, guestName, ready, onOpen }: Props) {
  const c = useWedding()
  return (
    <div
      className={`cover${phase === 'opening' ? ' cover--opening' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation"
    >
      <div className="cover__gate cover__gate--l" aria-hidden="true" />
      <div className="cover__gate cover__gate--r" aria-hidden="true" />

      <div className="cover__sparkles" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}
      </div>

      <div className="cover__corners" aria-hidden="true">
        <CornerOrnament corner="tl" size={132} className="cover__corner cover__corner--tl" />
        <CornerOrnament corner="tr" size={132} className="cover__corner cover__corner--tr" />
        <CornerOrnament corner="bl" size={132} className="cover__corner cover__corner--bl" />
        <CornerOrnament corner="br" size={132} className="cover__corner cover__corner--br" />
      </div>

      <div className="cover__content">
        <p className="cover__lead">The wedding of</p>
        <h1 className="names names--cover">
          <span>{c.groom}</span>
          <span className="names__amp" aria-hidden="true">
            &amp;
          </span>
          <span className="sr-only"> and </span>
          <span>{c.bride}</span>
        </h1>
        <Flourish className="cover__flourish" width={260} />
        <p className="cover__date">{formatLongDate(c)}</p>

        {guestName && <p className="cover__for">Invitation for {guestName}</p>}

        <button
          type="button"
          className="btn btn--primary cover__btn"
          onClick={onOpen}
          disabled={!ready}
          aria-label="Open wedding invitation"
        >
          {ready ? 'Open invitation' : 'Preparing…'}
        </button>

        <a
          href="https://voltbitsoftware.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="cover__credit"
        >
          Made by VOLTBIT Software
        </a>
      </div>
    </div>
  )
}
