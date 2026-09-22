import { CornerOrnament, Flourish } from '@/components/ornaments/Ornaments'
import { useWedding } from '@/config/WeddingContext'
import { formatLongDate } from '@/lib/datetime'

export function Footer() {
  const c = useWedding()
  return (
    <footer className="sec sec--black footer">
      <Flourish width={240} />
      <p className="footer__with">With love and gratitude</p>
      <p className="footer__names">
        {c.groom.split(' ')[0]} <span aria-hidden="true">&amp;</span>
        <span className="sr-only"> and </span> {c.bride.split(' ')[0]}
      </p>
      <p className="footer__date">{formatLongDate(c)}</p>
      <CornerOrnament corner="bl" size={100} className="sec__corner sec__corner--bl" />
      <CornerOrnament corner="br" size={100} className="sec__corner sec__corner--br" />

      <a
        href="https://voltbitsoftware.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer__credit"
      >
        Made by VOLTBIT Software
      </a>
    </footer>
  )
}
