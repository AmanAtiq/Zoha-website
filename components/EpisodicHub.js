import StarRating from "./StarRating";
import ReviewSection from "./ReviewSection";
import MoreFromAuthor from "./MoreFromAuthor";

export default function EpisodicHub({ book }) {
  const released = book.episodes.length;

  return (
    <main>
      <section className="book-detail-hero">
        <img className="book-detail-hero-image" src={book.hero} alt="" aria-hidden="true" />
        <div className="book-detail-hero-overlay" />
        <div className="container book-detail-hero-inner">
          <p className="eyebrow">{book.typeLabel}</p>
          <h1>{book.title}</h1>
          <p className="book-detail-urdu" lang="ur" dir="rtl">
            {book.titleUrdu}
          </p>
          {book.comingSoon && <span className="coming-soon-flag">Coming Soon</span>}
        </div>
      </section>

      <section className="section book-detail-overview-section">
        <div className="container book-detail-body">
          <div className="book-detail-cover">
            <img src={book.cover} alt={`${book.title} cover`} />
          </div>
          <div className="book-detail-content">
            {book.contentPlaceholder && (
              <span className="placeholder-banner">
                Placeholder content — final copy pending
              </span>
            )}

            {book.rating && (
              <div className="book-rating-summary">
                <StarRating value={book.rating.avg} />
                <span className="book-rating-count">
                  {book.rating.avg.toFixed(1)} · {book.rating.count.toLocaleString()} reviews
                </span>
              </div>
            )}

            <div className="chip-row book-detail-statuses">
              <span className={`chip ${book.moreEpisodesComing ? "chip--outline" : ""}`}>
                {book.moreEpisodesComing ? `Ongoing · ${released} episode${released === 1 ? "" : "s"} released` : "Complete"}
              </span>
              <span className="chip chip--outline">Urdu</span>
            </div>

            <p className="book-detail-tagline">
              {book.tagline}
              {book.placeholderCopy && (
                <span className="placeholder-flag">Placeholder copy</span>
              )}
            </p>

            <div className="book-detail-actions">
              <a href={`/novels/${book.slug}/${book.episodes[0].slug}`} className="btn btn-primary">
                Start with Episode 1
              </a>
              <a href="#episodes" className="btn btn-outline-dark">
                All Episodes
              </a>
              <a
                href="/#newsletter"
                className="btn btn-outline-dark notify-button"
              >
                Notify Me
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="container">
          <p className="lbl">Description</p>
          {book.descriptionUr && (
            <p className="description-ur" lang="ur" dir="rtl">{book.descriptionUr}</p>
          )}
          <p className="detail-prose">{book.description}</p>
        </div>
      </section>

      {book.genres?.length > 0 && (
        <section className="detail-section">
          <div className="container">
            <p className="lbl">Genres</p>
            <div className="chip-row">
              {book.genres.map((g) => (
                <span className="chip" key={g}>{g}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {book.authorNote && (
        <section className="detail-section detail-section--tint">
          <div className="container">
            <p className="lbl">Author's Note</p>
            <div className="author-note">
              <span className="author-note-avatar" aria-hidden="true">ZA</span>
              <div>
                <p>{book.authorNote}</p>
                <div className="author-note-name">ZOHA ASIF</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {book.excerpt && (
        <section className="detail-section">
          <div className="container">
            <p className="lbl">An Excerpt</p>
            <div className="excerpt-block">
              <div className="ur" lang="ur" dir="rtl">{book.excerpt.ur}</div>
              <div className="excerpt-source">{book.excerpt.source}</div>
            </div>
            {book.excerpt.episodeSlug && (
              <a href={`/novels/${book.slug}/${book.excerpt.episodeSlug}`} className="btn btn-outline-dark">
                Read This Episode
              </a>
            )}
          </div>
        </section>
      )}

      {book.forYou?.length > 0 && (
        <section className="detail-section detail-section--tint">
          <div className="container">
            <p className="lbl">This Novel Is For You If</p>
            <div className="for-you-grid">
              {book.forYou.map((t) => (
                <div className="for-you-card" key={t}>{t}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="detail-section" id="episodes">
        <div className="container">
          <p className="lbl">All Episodes</p>
          <div className="episode-grid">
            {book.episodes.map((ep, i) => (
              <a href={`/novels/${book.slug}/${ep.slug}`} className="episode-card" key={ep.slug}>
                <div className="episode-index">EPISODE {String(i + 1).padStart(2, "0")}</div>
                <div className="episode-title">{ep.title}</div>
                {(book.comingSoon || ep.comingSoon) && (
                  <span className="coming-soon-flag">Coming Soon</span>
                )}
                {ep.urduTitle && (
                  <div className="episode-title-ur" lang="ur" dir="rtl">{ep.urduTitle}</div>
                )}
                <p className="episode-synopsis">{ep.synopsis}</p>
              </a>
            ))}
            {book.moreEpisodesComing && (
              <div className="episode-card episode-card--locked">
                <div className="episode-index">NEXT</div>
                <div className="episode-synopsis">More episodes coming soon</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="detail-section detail-section--tint">
        <div className="container">
          <p className="lbl">What Readers Say About This Novel</p>
          <ReviewSection
            rating={book.rating}
            reviews={book.reviews || []}
            formPrompt="Which part of this novel stayed with you?"
            bookSlug={book.slug}
          />
        </div>
      </section>

      {book.quote && (
        <div className="detail-quote">
          <div className="ur" lang="ur" dir="rtl">{book.quote.ur}</div>
          <p>{book.quote.en}</p>
          <div className="source">{book.quote.source}</div>
        </div>
      )}

      <MoreFromAuthor more={book.more || []} />
    </main>
  );
}
