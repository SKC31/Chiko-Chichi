import { useId, type CSSProperties } from 'react'

/**
 * Original baroque-inspired ornaments, drawn as light inline SVG (no image files to download).
 * Strokes use the CSS variables --gold / --champagne so the theme lives in one place.
 */

/** Render once near the root: shared gradient used by ornament fills. */
export function GoldDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBF1DE" />
          <stop offset="0.45" stopColor="#F7E7CE" />
          <stop offset="1" stopColor="#C9A227" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const PETAL = 'M0 0 C 11 -12 12 -30 0 -44 C -12 -30 -11 -12 0 0 Z'
const LEAF = 'M0 0 C 5 -5 6 -13 0 -20 C -6 -13 -5 -5 0 0 Z'

/** The rosette artwork as a <g>, centred on 0,0 and spanning ±50 units. */
function RosetteShape() {
  return (
    <>
      <g stroke="var(--gold)" strokeWidth="1.1" strokeLinejoin="round" fill="url(#gold-fill)" fillOpacity="0.22">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`a${i}`} d={PETAL} transform={`rotate(${i * 30})`} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`b${i}`} d={PETAL} transform={`rotate(${i * 30 + 15}) scale(0.7)`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`c${i}`} d={PETAL} transform={`rotate(${i * 45}) scale(0.42)`} />
        ))}
      </g>
      <circle r="4" fill="var(--champagne)" stroke="var(--gold)" strokeWidth="1" />
    </>
  )
}

/** Layered chrysanthemum-style rosette. */
export function Rosette({ size = 64, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} className={className} style={style} aria-hidden="true" focusable="false">
      <RosetteShape />
    </svg>
  )
}

/** A symmetrical horizontal divider: centre rosette flanked by scrolls. */
export function Flourish({ className, width = 300 }: { className?: string; width?: number }) {
  const arm = (
    <g fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round">
      <path d="M182 22 C 200 22, 208 9, 230 9 C 250 9, 258 24, 247 31 C 239 36, 229 30, 234 23" />
      <path d="M182 24 C 202 28, 218 39, 246 39 C 268 39, 288 31, 310 22" />
      <path d="M262 36 C 266 30, 274 28, 280 30" strokeWidth="1" />
      <g fill="url(#gold-fill)" fillOpacity="0.5" strokeWidth="1">
        <path d={LEAF} transform="translate(214 13) rotate(-55)" />
        <path d={LEAF} transform="translate(226 40) rotate(60) scale(.9)" />
        <path d={LEAF} transform="translate(262 38) rotate(75) scale(.75)" />
      </g>
      <circle cx="234" cy="23" r="1.8" fill="var(--champagne)" stroke="none" />
      <circle cx="310" cy="22" r="1.6" fill="var(--champagne)" stroke="none" />
    </g>
  )
  return (
    <svg
      viewBox="0 0 320 44"
      width={width}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
      aria-hidden="true"
      focusable="false"
    >
      {arm}
      <g transform="translate(320 0) scale(-1 1)">{arm}</g>
      <g transform="translate(160 22)">
        <circle r="9.5" fill="none" stroke="var(--gold)" strokeWidth="1" />
        <g transform="scale(0.2)">
          <g stroke="var(--gold)" strokeWidth="4" strokeLinejoin="round" fill="url(#gold-fill)" fillOpacity="0.4">
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={PETAL} transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
        <circle r="2" fill="var(--champagne)" />
      </g>
    </svg>
  )
}

/** A quarter-frame scroll ornament for the corners of a section. Rotate via `corner`. */
export function CornerOrnament({
  corner = 'tl',
  size = 150,
  className,
}: {
  corner?: 'tl' | 'tr' | 'bl' | 'br'
  size?: number
  className?: string
}) {
  const flip = {
    tl: 'none',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1, -1)',
  }[corner]
  const scrolls = (
    <g fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 10 C 64 8, 112 14, 142 42 C 160 60, 152 88, 131 85 C 114 82, 112 63, 127 61" />
      <path d="M26 24 C 64 26, 92 36, 106 58 C 114 72, 104 86, 92 81" strokeWidth="1.1" />
      <path d="M10 10 C 44 30, 70 30, 96 22" strokeWidth="1" />
      <g fill="url(#gold-fill)" fillOpacity="0.45" strokeWidth="1">
        <path d={LEAF} transform="translate(70 14) rotate(80)" />
        <path d={LEAF} transform="translate(98 26) rotate(105) scale(.85)" />
        <path d={LEAF} transform="translate(120 44) rotate(130) scale(.8)" />
      </g>
      <circle cx="127" cy="61" r="2.2" fill="var(--champagne)" stroke="none" />
    </g>
  )
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ transform: flip }}
      aria-hidden="true"
      focusable="false"
    >
      {scrolls}
      <g transform="matrix(0 1 1 0 0 0)">{scrolls}</g>
      <g transform="translate(40 40) scale(0.6)">
        <RosetteShape />
      </g>
    </svg>
  )
}

/**
 * The oval "mirror" frame from the reference design, redrawn in gold.
 * If `photo` is empty a monogram is shown instead.
 */
export function OvalFrame({ photo, monogram, alt }: { photo?: string; monogram: string; alt: string }) {
  const uid = useId().replace(/:/g, '')
  const beads = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2
    return { x: 160 + 137 * Math.cos(a), y: 216 + 187 * Math.sin(a) }
  })
  return (
    <svg
      viewBox="0 0 320 440"
      className="oval-frame"
      role="img"
      aria-label={alt}
      style={{ width: '100%', height: 'auto' }}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <ellipse cx="160" cy="216" rx="119" ry="169" />
        </clipPath>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor="#5d7534" />
          <stop offset="0.6" stopColor="#3F4F23" />
          <stop offset="1" stopColor="#2B3719" />
        </radialGradient>
      </defs>

      {/* photo or monogram */}
      <g clipPath={`url(#clip-${uid})`}>
        {photo ? (
          <image href={photo} x="40" y="46" width="240" height="340" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <>
            <rect x="40" y="46" width="240" height="340" fill={`url(#bg-${uid})`} />
            <text
              x="160"
              y="238"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="76"
              fontWeight="500"
              fill="var(--champagne)"
              letterSpacing="2"
            >
              {monogram}
            </text>
          </>
        )}
      </g>

      {/* frame */}
      <ellipse cx="160" cy="216" rx="119" ry="169" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
      <ellipse cx="160" cy="216" rx="124" ry="174" fill="none" stroke="var(--champagne)" strokeWidth="0.8" opacity="0.7" />
      <ellipse cx="160" cy="216" rx="148" ry="198" fill="none" stroke="var(--gold)" strokeWidth="2.5" />
      <ellipse cx="160" cy="216" rx="128" ry="178" fill="none" stroke="var(--gold)" strokeWidth="1" />
      {beads.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="2" fill="var(--champagne)" stroke="var(--gold)" strokeWidth="0.6" />
      ))}

      {/* crest & foot */}
      <g fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M160 26 C 132 20, 112 28, 98 40 C 90 47, 96 56, 104 52" />
        <path d="M160 26 C 188 20, 208 28, 222 40 C 230 47, 224 56, 216 52" />
        <path d="M160 414 C 132 420, 112 412, 98 400 C 90 393, 96 384, 104 388" />
        <path d="M160 414 C 188 420, 208 412, 222 400 C 230 393, 224 384, 216 388" />
      </g>
      <g transform="translate(160 28) scale(0.56)">
        <RosetteShape />
      </g>
      <g transform="translate(160 414) scale(0.44)">
        <RosetteShape />
      </g>
      {[
        [10, 216],
        [310, 216],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y - 9} L${x + 6} ${y} L${x} ${y + 9} L${x - 6} ${y} Z`} fill="var(--champagne)" stroke="var(--gold)" />
      ))}
    </svg>
  )
}
