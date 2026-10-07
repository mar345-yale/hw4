import { Link } from 'react-router-dom'

const VALUES = [
  {
    title: 'Officially licensed, always',
    body: 'Every crest, wordmark, and bulldog on our shelves is the real deal, licensed by Yale. No knockoffs, ever.',
  },
  {
    title: 'Something for every Bulldog',
    body: 'All 14 residential colleges, more than 20 varsity sports, graduate and professional schools, and the whole family, from Mom to Grandpa.',
  },
  {
    title: 'Made to be worn',
    body: 'Heavyweight hoodies, soft tri-blend tees, and fleece that holds up in a Connecticut winter. We pick pieces you’ll reach for again and again.',
  },
  {
    title: 'Rooted in New Haven',
    body: 'We’re a local shop at 57 Broadway, and we still ship Bulldog pride to fans in more than 30 countries.',
  },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow eyebrow-light">About Us</span>
        <h1>We’re Campus Customs. Yale is our neighborhood.</h1>
        <p>
          Yale Bulldog Blue is the Yale store run by Campus Customs. We’re a shop on Broadway, and we
          think the best college gear comes from people who actually live where the college is.
        </p>
      </section>

      <section className="section about-story">
        <div>
          <h2>Our story</h2>
          <p>
            Walk down Broadway on a fall afternoon and you’ll see it: Yale blue everywhere. First-years
            in brand-new crewnecks, alumni back for The Game, parents who just picked up a “Yale Mom”
            sweatshirt and won’t take it off. That pride is what keeps us going.
          </p>
          <p>
            Yale Bulldog Blue exists to give that pride a home. Our goal is simple. When you
            pull on one of our hoodies, it should feel like Yale: classic, comfortable, and a little
            bit proud of itself.
          </p>
          <p>
            Maybe you’re repping your residential college, cheering on the Bulldogs, or celebrating
            a new grad in the family. Whatever brings you here, we’re glad you came.
          </p>
        </div>
        <aside className="about-card">
          <h3>Visit the shop</h3>
          <p>
            57 Broadway
            <br />
            New Haven, CT 06511
          </p>
          <h3>Questions about an order?</h3>
          <p>
            <a href="mailto:orderdept@campuscustoms.com">orderdept@campuscustoms.com</a>
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse the shop
          </Link>
        </aside>
      </section>

      <section className="section section-dark">
        <div className="section-head">
          <h2>What we stand for</h2>
        </div>
        <div className="collection-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="collection-card static">
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
