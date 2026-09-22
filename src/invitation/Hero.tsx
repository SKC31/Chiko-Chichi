import { CornerOrnament, Flourish, OvalFrame } from '@/components/ornaments/Ornaments'
import { useWedding } from '@/config/WeddingContext'
import { formatLongDate, formatWeekday } from '@/lib/datetime'

export function Hero() {
  const c = useWedding()
  const monogram = `${c.groom.charAt(0)} & ${c.bride.charAt(0)}`
  return (
    <section className="sec sec--olive hero" aria-labelledby="hero-title">
      <CornerOrnament corner="tl" size={120} className="sec__corner sec__corner--tl" />
      <CornerOrnament corner="tr" size={120} className="sec__corner sec__corner--tr" />

      <p className="hero__lead">We joyfully invite you to the wedding of</p>

      <div className="hero__frame">
        <OvalFrame photo={c.heroPhoto} monogram={monogram} alt={`${c.groom} and ${c.bride}`} />
      </div>

      <h2 id="hero-title" className="names">
        <span>{c.groom}</span>
        <span className="names__amp" aria-hidden="true">
          &amp;
        </span>
        <span className="sr-only"> and </span>
        <span>{c.bride}</span>
      </h2>

      <Flourish className="hero__flourish" />
      <p className="hero__date">
        {formatWeekday(c)}
        <br />
        <strong>{formatLongDate(c)}</strong>
      </p>
    </section>
  )
}
