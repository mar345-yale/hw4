import { Link } from 'react-router-dom'
import { formatPrice } from '../api'
import { useChatResults } from '../chatResults'

/** A dismissible strip, pinned under the nav, that shows the product matches the chat
 *  assistant last surfaced. Clicking a card opens the normal single-item page. */
export default function ChatResultsBand() {
  const { products, query, clear } = useChatResults()
  if (products.length === 0) return null

  return (
    <aside className="results-band" aria-label="Products from your chat">
      <div className="results-band-head">
        <div>
          <span className="eyebrow">From your chat</span>
          <h3>{query ? `Matches for “${query}”` : 'Picked for you'}</h3>
        </div>
        <button className="results-band-close" aria-label="Dismiss chat results" onClick={clear}>
          Clear ×
        </button>
      </div>
      <div className="results-band-track">
        {products.map((p) => (
          <Link key={p.product_id} to={p.product_url} className="results-card">
            <div className="results-card-img">
              <img src={p.image_url} alt={p.name} loading="lazy" />
              {!p.in_stock && <span className="badge badge-out">Sold out</span>}
            </div>
            <div className="results-card-body">
              <span className="eyebrow">{p.category}</span>
              <span className="results-card-name">{p.name}</span>
              <p className="results-card-desc">{p.description}</p>
              <span className="price">{formatPrice(p.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
