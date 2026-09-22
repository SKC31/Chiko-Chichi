import { useMusic } from './MusicProvider'

/** Small floating control. Sits in the bottom-right corner, hugging the invitation column on desktop. */
export function MusicButton() {
  const { started, playing, available, toggle } = useMusic()
  if (!started || !available) return null

  return (
    <button
      type="button"
      className={`music-btn${playing ? ' is-playing' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Pause wedding music' : 'Play wedding music'}
      aria-pressed={playing}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path d="M4 9.5v5h3.6l4.4 3.6V5.9L7.6 9.5H4z" fill="currentColor" />
          <path d="M15.4 8.6a4.6 4.6 0 0 1 0 6.8M17.9 6.1a8.2 8.2 0 0 1 0 11.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path d="M4 9.5v5h3.6l4.4 3.6V5.9L7.6 9.5H4z" fill="currentColor" />
          <path d="M15.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}
