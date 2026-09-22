import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Rosette } from '@/components/ornaments/Ornaments'
import { useWedding } from '@/config/WeddingContext'

/**
 * 3D coverflow gallery (the reference design's signature gallery).
 * While no photos are configured it shows elegant placeholders — see src/config/wedding.ts.
 */
export function Gallery() {
  const c = useWedding()
  const photos = c.gallery.photos
  const count = photos.length > 0 ? photos.length : c.gallery.placeholderCount
  const [active, setActive] = useState(Math.min(1, count - 1))
  const startX = useRef<number | null>(null)

  const go = useCallback((i: number) => setActive(Math.max(0, Math.min(count - 1, i))), [count])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(active - 1)
    if (e.key === 'ArrowRight') go(active + 1)
  }
  const onDown = (e: PointerEvent) => {
    startX.current = e.clientX
  }
  const onUp = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1))
  }

  return (
    <section className="sec sec--black gallery" aria-labelledby="gallery-title">
      <h2 className="sec__title" id="gallery-title">
        Photo Gallery
      </h2>

      <div
        className="cf"
        role="group"
        aria-roledescription="carousel"
        aria-label="Photo gallery"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (startX.current = null)}
      >
        {Array.from({ length: count }, (_, i) => {
          const o = i - active
          const photo = photos[i]
          return (
            <figure
              key={i}
              className={`cf__slide${o === 0 ? ' is-active' : ''}`}
              style={{ ['--o' as string]: o, ['--abs' as string]: Math.abs(o) }}
              aria-hidden={o !== 0}
              onClick={() => o !== 0 && go(i)}
            >
              {photo ? (
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable={false} />
              ) : (
                <div className="cf__placeholder">
                  <Rosette size={54} />
                  <span>Photo to be added</span>
                </div>
              )}
            </figure>
          )
        })}
      </div>

      <div className="cf__nav">
        <button type="button" className="cf__arrow" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous photo">
          ‹
        </button>
        <div className="cf__dots" role="tablist" aria-label="Choose photo">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1} of ${count}`}
              className={`cf__dot${i === active ? ' is-active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="cf__arrow" onClick={() => go(active + 1)} disabled={active === count - 1} aria-label="Next photo">
          ›
        </button>
      </div>
    </section>
  )
}
