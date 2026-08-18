export default function Afsanay({ items = [] }) {
  return (
    <section className="section" id="afsanay">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow eyebrow--dark">Short Stories</p>
          <h2>Afsanay</h2>
          <p className="section-lede">
            Small stories carrying big, unspoken feelings — read in one sitting.
          </p>
        </div>

        <div className="afsana-list">
          {items.map((book, i) => (
            <article className="afsana-item" key={book.slug}>
              <span className="afsana-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="afsana-cover">
                <img src={book.cover} alt={`${book.title} cover`} />
              </div>
              <div className="afsana-body">
                <h3>{book.title}</h3>
                {book.comingSoon && <span className="coming-soon-flag">Coming Soon</span>}
                <p>{book.tagline}</p>
              </div>
              <a href={`/novels/${book.slug}`} className="link-arrow">
                Read Now
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
