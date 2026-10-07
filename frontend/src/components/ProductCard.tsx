import { Link } from 'react-router-dom'
import { formatPrice, type Product } from '../api'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.product_id}`} className="product-card">
      <div className="product-card-img">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {!product.in_stock && <span className="badge badge-out">Sold out</span>}
      </div>
      <div className="product-card-body">
        <span className="eyebrow">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <span className="price">{formatPrice(product.price)}</span>
      </div>
    </Link>
  )
}
