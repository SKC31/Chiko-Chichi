import { useInvitation } from './InvitationContext'

export function Greeting() {
  const { guest } = useInvitation()
  return (
    <section className="sec sec--black greeting" aria-labelledby="greeting-title">
      <p className="greeting__dear" id="greeting-title">
        Dear {guest.display_name},
      </p>
      <p className="greeting__text">We joyfully invite you to celebrate this special day with us.</p>
    </section>
  )
}
