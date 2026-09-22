import { Flourish } from './ornaments/Ornaments'

interface Props {
  title: string
  text: string
  action?: { label: string; onClick: () => void }
}

/** Full-screen, on-brand message used for invalid links, errors and the landing page. */
export function Message({ title, text, action }: Props) {
  return (
    <main className="message" role="main">
      <Flourish width={220} />
      <h1 className="message__title">{title}</h1>
      <p className="message__text">{text}</p>
      {action && (
        <button type="button" className="btn btn--primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </main>
  )
}
