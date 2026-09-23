import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  onClose: () => void
  children: ReactNode
  labelledBy: string
}

/**
 * Small centered popup used for admin edit actions, so the admin does not
 * have to scroll back to the top of the page to reach a form.
 * Closes on Escape or a click on the dimmed backdrop.
 */
export function Modal({ onClose, children, labelledBy }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      className="a-modal-backdrop"
      ref={backdropRef}
      onMouseDown={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
    >
      <div className="a-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button type="button" className="a-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
