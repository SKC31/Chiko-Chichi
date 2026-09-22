import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { defaultWedding } from '@/config/wedding'

interface MusicApi {
  /** True once the guest has pressed OPEN INVITATION. */
  started: boolean
  playing: boolean
  /** False when the song file is missing/unsupported, so the control can be hidden. */
  available: boolean
  /** Must be called directly from a click handler (browser autoplay rules). */
  start: (src: string) => void
  toggle: () => void
}

const MusicContext = createContext<MusicApi | null>(null)

/**
 * ONE persistent <audio> for the whole invitation. It is created lazily on the
 * first user gesture, so nothing is downloaded before the guest opens the card,
 * and it is never recreated — moving between sections cannot restart the song.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [available, setAvailable] = useState(true)

  const attempt = useCallback((audio: HTMLAudioElement) => {
    // play() returns a promise that rejects if the browser blocks it or the file is missing.
    audio.play().catch((err: unknown) => {
      const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: unknown }).name) : ''
      if (name === 'NotSupportedError') setAvailable(false)
      setPlaying(false)
    })
  }, [])

  const start = useCallback(
    (src: string) => {
      setStarted(true)
      if (!audioRef.current) {
        const audio = new Audio()
        audio.loop = true
        audio.preload = 'auto'
        audio.addEventListener('play', () => setPlaying(true))
        audio.addEventListener('pause', () => setPlaying(false))
        audio.addEventListener('error', () => {
          // code 4 = source missing / unsupported. Other codes (network) stay retryable.
          if (audio.error?.code === 4) setAvailable(false)
          setPlaying(false)
        })
        audio.src = src || defaultWedding.music.src
        audioRef.current = audio
      }
      attempt(audioRef.current)
    },
    [attempt],
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) attempt(audio) // resumes from the same position — never reloads
    else audio.pause()
  }, [attempt])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const value = useMemo(() => ({ started, playing, available, start, toggle }), [started, playing, available, start, toggle])
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic(): MusicApi {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}
