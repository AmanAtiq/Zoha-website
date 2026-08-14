export default function EpisodicNovels({ items = [] }) {
  return (
    <section className="section" id="episodic">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow eyebrow--dark">Ongoing</p>
          <h2>Episodic Novels</h2>
          <p className="section-lede">
            Released episode by episode — follow along as the story unfolds.
          </p>
        </div>

        {items.map((book) => (
          <article className="episodic-feature" key={book.slug}>
            <div className="episodic-cover">
              <img src={book.cover} alt={`${book.title} cover`} />
              <span className="book-badge">{book.badge}</span>
            </div>
            <div className="episodic-body">
              <h3>{book.title}</h3>
              <p className="episodic-sub" lang="ur" dir="rtl">{book.titleUrdu}</p>
              <span className={`book-status ${book.moreEpisodesComing ? "book-status--ongoing" : "book-status--complete"}`}>
                {book.moreEpisodesComing ? "Ongoing" : "Complete"}
              </span>
              <p>{book.tagline}</p>
              <a href={`/novels/${book.slug}`} className="btn btn-primary">
                Read / Download PDF
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
