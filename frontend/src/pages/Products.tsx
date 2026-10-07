import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, type Product } from '../api'
import ProductCard from '../components/ProductCard'
import { COLLECTIONS, inCollection } from '../collections'

const CATEGORY_ORDER = ['Hoodies', 'Crewnecks', 'T-Shirts', 'Quarter-Zips', 'Fleece & Jackets']

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'All'
  const query = params.get('q') ?? ''
  const collection = COLLECTIONS.find((c) => c.slug === params.get('collection'))

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value && value !== 'All') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (!collection || inCollection(p.name, collection)) &&
        (!q || `${p.name} ${p.description} ${p.colors.join(' ')}`.toLowerCase().includes(q)),
    )
  }, [products, category, query, collection])

  return (
    <>
      <section className="page-hero compact">
        <span className="eyebrow eyebrow-light">The Shop</span>
        <h1>{collection ? collection.title : 'All Products'}</h1>
        <p>Every piece in our catalogue, with real prices and sizes straight from our shelves.</p>
      </section>

      <section className="section">
        <div className="filters">
          <div className="chips" role="tablist">
            {['All', ...CATEGORY_ORDER].map((c) => (
              <button
                key={c}
                className={`chip ${c === category ? 'active' : ''}`}
                onClick={() => updateParam('category', c)}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            className="search"
            type="search"
            placeholder="Search: Berkeley, hockey…"
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            aria-label="Search products"
          />
        </div>

        {status === 'loading' && (
          <div className="product-grid" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton skeleton-img" />
                <div className="product-card-body">
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line price" />
                </div>
              </div>
            ))}
          </div>
        )}
        {status === 'error' && (
          <div className="notice error">
            <p>We couldn’t reach the shop just now.</p>
            <button className="btn btn-primary" onClick={() => location.reload()}>
              Try again
            </button>
          </div>
        )}
        {status === 'ready' && (
          <>
            <p className="muted result-count">
              Showing {visible.length} of {products.length} products
              {collection && (
                <button className="chip active chip-clear" onClick={() => updateParam('collection', '')}>
                  {collection.title} ×
                </button>
              )}
            </p>
            {visible.length === 0 ? (
              <div className="empty-state">
                <p>No products match that yet.</p>
                <button
                  className="btn btn-ghost"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {visible.map((p) => (
                  <ProductCard key={p.product_id} product={p} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
