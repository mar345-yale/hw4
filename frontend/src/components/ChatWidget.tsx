import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatPrice } from '../api'
import { useAuth } from '../auth'
import { useChatResults, type ChatProduct } from '../chatResults'
import { playBark, primeAudio } from '../bark'

interface Message {
  role: 'user' | 'assistant'
  content: string
  products?: ChatProduct[]
}

const GREETING: Message = {
  role: 'assistant',
  content:
    "Hey there, Bulldog! I'm the Campus Customs helper. Ask me about hoodies, sizes, prices, or gifts for the Yale family in your life.",
}

// Tappable starter prompts, shown before the shopper has typed anything.
const SUGGESTIONS = [
  'Hoodies under $70',
  'Gifts for Mom',
  'Show me crewnecks',
  'Fleece & jackets',
]

/** The product id when the shopper is on a single-item page, else null. */
function useCurrentProductId(): string | null {
  const { pathname } = useLocation()
  const match = pathname.match(/^\/products\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function ChatWidget() {
  const { user } = useAuth()
  const { show } = useChatResults()
  const currentProductId = useCurrentProductId()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('cc_bark') !== 'off')
  const listRef = useRef<HTMLDivElement>(null)

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on
      localStorage.setItem('cc_bark', next ? 'on' : 'off')
      if (next) {
        primeAudio()
        playBark()
      }
      return next
    })
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open, busy])

  // Load saved history when a shopper logs in; reset to the greeting when they log out.
  useEffect(() => {
    if (!user) {
      setMessages([GREETING])
      return
    }
    let active = true
    const token = localStorage.getItem('cc_token')
    fetch('/api/chat/history', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((past: Message[]) => {
        if (!active) return
        setMessages(past.length > 0 ? past : [GREETING])
      })
      .catch(() => active && setMessages([GREETING]))
    return () => {
      active = false
    }
  }, [user])

  const sendText = async (raw: string) => {
    const text = raw.trim()
    if (!text || busy) return

    const history = messages
      .filter((m) => m !== GREETING)
      .map((m) => ({ role: m.role, content: m.content }))
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setDraft('')
    setBusy(true)
    primeAudio() // unlock audio within this user gesture so the reply can bark

    try {
      const token = localStorage.getItem('cc_token')
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history, product_id: currentProductId }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply, products: data.products }])
      if (soundOn) playBark() // a friendly woof to match Handsome Dan
      // Surface the matches on the page itself, not just inside the chat panel.
      if (data.products && data.products.length > 0) show(data.products, text)
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            "Sorry, I hit a snag reaching the shop just now. Please try again in a moment, or email orderdept@campuscustoms.com.",
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  const send = (e: FormEvent) => {
    e.preventDefault()
    void sendText(draft)
  }

  return (
    <div className="chat">
      {open && (
        <section className="chat-panel" aria-label="Campus Customs chat">
          <header className="chat-header">
            <div>
              <strong>Ask Campus Customs</strong>
              <span className="chat-status">
                {user ? `Signed in as ${user.first_name ?? 'you'}` : 'Your Yale merch helper'}
              </span>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-sound"
                aria-label={soundOn ? 'Mute bark' : 'Unmute bark'}
                title={soundOn ? 'Bark on' : 'Bark off'}
                onClick={toggleSound}
              >
                {soundOn ? '🔊' : '🔇'}
              </button>
              <button className="chat-close" aria-label="Close chat" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
          </header>

          <div className="chat-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-row ${m.role}`}>
                <div className={`chat-bubble ${m.role}`}>{m.content}</div>
                {m.products && m.products.length > 0 && (
                  <div className="chat-cards">
                    {m.products.map((p) => (
                      <Link
                        key={p.product_id}
                        to={p.product_url}
                        className="chat-card"
                        onClick={() => setOpen(false)}
                      >
                        <img src={p.image_url} alt={p.name} loading="lazy" />
                        <div className="chat-card-body">
                          <span className="chat-card-name">{p.name}</span>
                          <span className="chat-card-meta">
                            {formatPrice(p.price)}
                            {!p.in_stock && <em className="chat-card-out"> · Sold out</em>}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="chat-bubble assistant typing">Thinking…</div>}
            {messages.length <= 1 && !busy && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chat-suggestion" onClick={() => void sendText(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="chat-input" onSubmit={send}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about merch, sizes, prices…"
              aria-label="Chat message"
              disabled={busy}
            />
            <button className="btn btn-primary" type="submit" disabled={!draft.trim() || busy}>
              Send
            </button>
          </form>
        </section>
      )}
      <button
        className="chat-launcher"
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
