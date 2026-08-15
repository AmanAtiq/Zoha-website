export default function ShortNovels({ items = [] }) {
  return (
    <section className="section section--tint" id="short-novels">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow eyebrow--dark">Complete in One</p>
          <h2>Short Novels</h2>
          <p className="section-lede">
            Full stories, complete and ready to read from start to end.
          </p>
        </div>

        <div className="card-grid">
          {items.map((book) => (
            <article className="book-card" key={book.slug}>
              <div className="book-cover">
                <img src={book.cover} alt={`${book.title} cover`} />
                <span className="book-badge">{book.badge}</span>
              </div>
              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p>
                  {book.tagline}
                  {book.placeholderCopy && (
                    <span className="placeholder-flag">Placeholder copy</span>
                  )}
                </p>
                <a href={`/novels/${book.slug}`} className="link-arrow">
                  Read Now
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
