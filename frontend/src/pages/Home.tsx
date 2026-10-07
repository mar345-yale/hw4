import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, type Product } from '../api'
import ProductCard from '../components/ProductCard'
import HandsomeDan from '../components/HandsomeDan'
import { COLLECTIONS } from '../collections'

const HERO_PICKS = [
  'basic-hoodie-big-yale',
  'yale-mom-crewneck',
  '2025-yale-vs-harvard-t-shirt',
  'champion-reverse-weave-hoodie-1',
]

const CATEGORIES = [
  { name: 'Hoodies', blurb: 'The ones you live in from October to April.' },
  { name: 'Crewnecks', blurb: 'Classic, cozy, and right for every occasion.' },
  { name: 'T-Shirts', blurb: 'Game days, gym days, and every day in between.' },
  { name: 'Quarter-Zips', blurb: 'Dressed up enough for the office, comfy enough for the couch.' },
  { name: 'Fleece & Jackets', blurb: 'Warm layers for a New Haven winter.' },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  const heroImages = HERO_PICKS.map((id) => products.find((p) => p.product_id === id)).filter(
    (p): p is Product => Boolean(p),
  )
  const featured = products.filter((p) => !HERO_PICKS.includes(p.product_id)).slice(0, 8)

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">Yale Bulldog Blue</span>
            <h1 className="hero-title">Campus Customs</h1>
            <p className="hero-tagline">
              Bulldog pride, <span className="accent">made for every day.</span>
            </p>
            <p>
              We’re a New Haven shop outfitting Yale students, alumni, and the families who cheer
              them on. Every piece is officially licensed, comfortable, and made
              to be worn a lot, whether it’s a game-day Saturday or a long study night.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop the collection
              </Link>
              <Link to="/about" className="btn btn-ghost btn-lg">
                Our story
              </Link>
            </div>
          </div>
          <div className="hero-collage" aria-hidden="true">
            {heroImages.map((p) => (
              <img key={p.product_id} src={p.image_url} alt="" />
            ))}
          </div>
        </div>
      </section>

      <section className="welcome">
        <div className="welcome-inner">
          <div className="welcome-dan">
            <HandsomeDan className="dan-svg" />
          </div>
          <div className="welcome-copy">
            <div className="speech-bubble">Woof! Welcome to Campus Customs!</div>
            <h2>Say hi to Handsome Dan</h2>
            <p>
              Our favorite Bulldog is happy you stopped by. Whether you’re after a cozy hoodie,
              a gift for the Yale family, or game-day gear, we’ll help you find it. Tap the chat
              in the corner and Dan’s helper will point you the right way.
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Start shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Shop by style</h2>
          <p className="muted">Casual comfort, classic Bulldog pride.</p>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to={`/products?category=${encodeURIComponent(c.name)}`}
              className="category-tile"
            >
              <h3>{c.name}</h3>
              <p>{c.blurb}</p>
              <span className="tile-arrow">Shop →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-head">
          <h2>Find your corner of Yale</h2>
          <p className="muted">
            Big pride, Big Yale. Everyone has their own Yale, so we carry gear for all of them.
          </p>
        </div>
        <div className="collection-grid">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to={`/products?collection=${c.slug}`}
              className="collection-card"
            >
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section">
          <div className="section-head row">
            <h2>Fresh off the shelf</h2>
            <Link to="/products" className="text-link">
              View all products →
            </Link>
          </div>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="visit-band">
        <div>
          <h2>Come say hi on Broadway</h2>
          <p>
            Stop by our store at <strong>57 Broadway, New Haven, CT 06511</strong>, just steps from
            campus. Can’t make it in person? Ask our chat helper in the corner, or email{' '}
            <a href="mailto:orderdept@campuscustoms.com">orderdept@campuscustoms.com</a>.
          </p>
        </div>
      </section>
    </>
  )
}
