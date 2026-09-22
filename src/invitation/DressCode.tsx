import { useWedding } from '@/config/WeddingContext'

export function DressCode() {
  const c = useWedding()
  return (
    <section className="sec sec--olive dresscode" aria-labelledby="dress-title">
      <h2 className="sec__title" id="dress-title">
        Dress Code
      </h2>
      <p className="sec__intro">We would be delighted to see you in our wedding colours.</p>
      <ul className="dresscode__list">
        {c.dressCode.map((s) => (
          <li key={s.name} className="dresscode__item">
            <span className="dresscode__swatch" style={{ background: s.hex }} aria-hidden="true" />
            <span className="dresscode__name">{s.name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
