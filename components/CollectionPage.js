import CollectionHeroSlider from "./CollectionHeroSlider";

const COLLECTIONS = {
  episodic: {
    eyebrow: "Read as it unfolds",
    title: "Episodic Novels",
    description: "Stories that arrive one chapter at a time, giving you room to live with every reveal.",
    intro: "Follow a long-form story at its own pace — one episode, one quiet cliffhanger, one feeling you cannot quite put down.",
    linkLabel: "Explore the series",
  },
  "short-novel": {
    eyebrow: "One complete sitting",
    title: "Short Novels",
    description: "Full, finished stories for the reader who wants to disappear into a world and come back changed.",
    intro: "No waiting for the next chapter. Choose a complete story, settle in, and let the last page find you when it is ready.",
    linkLabel: "Read this story",
  },
  afsana: {
    eyebrow: "Small stories, deep feeling",
    title: "Afsanay",
    description: "Short fiction for the feelings that are too large to leave unnamed.",
    intro: "Each afsana is brief enough for one sitting and spacious enough to stay with you long after it ends.",
    linkLabel: "Open the afsana",
  },
};

export default function CollectionPage({ type, items = [], heroSlides = [] }) {
  const collection = COLLECTIONS[type] || {};
  const slides = heroSlides.length ? heroSlides : items.slice(0, 1);

  return (
    <main className={`collection-page collection-page--${type}`}>
      <CollectionHeroSlider collection={collection} slides={slides} />

      <section className="collection-intro">
        <div className="container collection-intro-inner">
          <p className="collection-intro-copy">{collection.intro}</p>
        </div>
      </section>

      <section className="section collection-books" id="collection-books">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow eyebrow--dark">Choose your next read</p>
            <h2>Find the story that stays.</h2>
          </div>
          <div className={`collection-grid collection-grid--${type}`}>
            {items.map((book, index) => (
              <article className="collection-card" key={book.slug}>
                <a className="collection-card-cover" href={`/novels/${book.slug}`}>
                  <img src={book.cover} alt={`${book.title} cover`} />
                  <span className="book-badge">{book.badge}</span>
                </a>
                <div className="collection-card-body">
                  <span className="collection-card-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{book.title}</h3>
                    <p className="collection-card-urdu" lang="ur" dir="rtl">{book.titleUrdu}</p>
                    {type === "episodic" && (
                      <span className={`book-status ${book.moreEpisodesComing ? "book-status--ongoing" : "book-status--complete"}`}>
                        {book.moreEpisodesComing ? "Ongoing" : "Complete"}
                      </span>
                    )}
                    <p>{book.tagline}</p>
                    <a className="link-arrow" href={`/novels/${book.slug}`}>{collection.linkLabel} →</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="collection-cta">
        <div className="container collection-cta-inner">
          <div>
            <p className="eyebrow">Take the story home</p>
            <h2>Prefer a page you can hold?</h2>
            <p>Reserve a physical first-print edition for your shelf.</p>
          </div>
          <a className="btn btn-primary" href="/prebooking">Browse prebooking</a>
        </div>
      </section>
    </main>
  );
}
