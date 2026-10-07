import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct, formatPrice, type ProductDetail as Detail } from '../api'

const LOW_STOCK = 3

function stockLabel(qty: number) {
  if (qty === 0) return { text: 'Sold out', cls: 'out' }
  if (qty <= LOW_STOCK) return { text: `Only ${qty} left`, cls: 'low' }
  return { text: `${qty} in stock`, cls: 'ok' }
}

// Keyed by product id so all state resets cleanly when navigating between products.
export default function ProductDetailPage() {
  const { productId = '' } = useParams()
  return <ProductDetail key={productId} productId={productId} />
}

function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct(productId)
      .then(setProduct)
      .catch((e: Error) => setError(e.message))
  }, [productId])

  if (error) {
    return (
      <section className="section narrow">
        <p className="notice error">
          {error === 'not-found'
            ? 'We couldn’t find that product.'
            : 'We couldn’t reach the product API. Is the backend running?'}
        </p>
        <Link to="/products" className="text-link">
          ← Back to all products
        </Link>
      </section>
    )
  }
  if (!product) {
    return (
      <section className="section" aria-busy="true" aria-label="Loading product">
        <div className="detail">
          <div className="detail-info">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line title" />
            <div className="skeleton skeleton-line price" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
          <div className="detail-image skeleton skeleton-detail-img" />
        </div>
      </section>
    )
  }

  const chosen = product.sizes.find((s) => s.size === selected)

  return (
    <section className="section">
      <Link to="/products" className="text-link back-link">
        ← Back to all products
      </Link>
      <div className="detail">
        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatPrice(product.price)}</div>
          <p className="detail-desc">{product.description}</p>

          <dl className="detail-meta">
            <dt>Style</dt>
            <dd className="capitalize">{product.garment_type}</dd>
            <dt>Colors</dt>
            <dd className="capitalize">{product.colors.join(', ')}</dd>
          </dl>

          <h3 className="detail-subhead">Sizes &amp; stock</h3>
          <div className="size-grid">
            {product.sizes.map((s) => {
              const label = stockLabel(s.quantity)
              return (
                <button
                  key={s.size}
                  className={`size-btn ${label.cls} ${selected === s.size ? 'selected' : ''}`}
                  disabled={s.quantity === 0}
                  onClick={() => setSelected(s.size)}
                >
                  <strong>{s.size}</strong>
                  <span>{label.text}</span>
                </button>
              )
            })}
          </div>

          <button className="btn btn-primary btn-lg btn-block" disabled={!chosen}>
            {chosen ? `Add size ${chosen.size} to bag` : 'Select a size'}
          </button>
          <p className="muted small">Checkout isn’t available on this site yet.</p>
        </div>

        <div className="detail-image">
          <img src={product.image_url} alt={product.name} />
        </div>
      </div>
    </section>
  )
}
