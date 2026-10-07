import { Link } from 'react-router-dom'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">Campus Customs</div>
          <p className="muted">Yale Bulldog Blue. Casual comfort, classic Bulldog pride.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Hoodies">Hoodies</Link>
          <Link to="/products?category=Crewnecks">Crewnecks</Link>
          <Link to="/products?category=T-Shirts">T-Shirts</Link>
        </div>
        <div>
          <h4>Visit</h4>
          <span>57 Broadway</span>
          <span>New Haven, CT 06511</span>
          <a href="mailto:orderdept@campuscustoms.com">orderdept@campuscustoms.com</a>
        </div>
      </div>
      <div className="footer-base">© {YEAR} Yale Bulldog Blue by Campus Customs</div>
    </footer>
  )
}
