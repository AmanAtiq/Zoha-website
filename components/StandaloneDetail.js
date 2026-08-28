import StarRating from "./StarRating";
import ReviewSection from "./ReviewSection";
import MoreFromAuthor from "./MoreFromAuthor";
import ShareButton from "./ShareButton";
import ReadDownloadButton from "./ReadDownloadButton";

export default function StandaloneDetail({ book }) {
  const authorNoteIsUrdu = /[\u0600-\u06FF]/.test(book.authorNote || "");

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
          <span className="book-badge book-badge--static">{book.badge}</span>
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
              <span className="chip">Complete</span>
              <span className="chip chip--outline">Free to read</span>
              <span className="chip chip--outline">Urdu</span>
            </div>

            <p className="book-detail-tagline">
              {book.tagline}
              {book.placeholderCopy && (
                <span className="placeholder-flag">Placeholder copy</span>
              )}
            </p>

            <div className="book-detail-actions">
              <ReadDownloadButton
                href={book.pdf}
                comingSoon={book.comingSoon}
                bookSlug={book.slug}
                showStats={book.showReadDownloadStats}
                stats={book.assetStats}
              />
              <ShareButton title={book.title} text={book.tagline} />
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
              <img className="author-note-avatar" src="/images/logo/logo-maroon-bg.png" alt="" aria-hidden="true" />
              <div>
                <p
                  className={`author-note-copy${authorNoteIsUrdu ? " author-note-copy--urdu" : ""}`}
                  lang={authorNoteIsUrdu ? "ur" : "en"}
                  dir={authorNoteIsUrdu ? "rtl" : "ltr"}
                >
                  {book.authorNote}
                </p>
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
          </div>
        </section>
      )}

      {book.readingTips?.length > 0 && (
        <section className="detail-section detail-section--tint">
          <div className="container">
            <p className="lbl">How To Read This</p>
            <div className="reading-tips-grid">
              {book.readingTips.map((tip) => (
                <div className="reading-tip" key={tip.label}>
                  <div className="reading-tip-label">{tip.label}</div>
                  <div className="reading-tip-detail">{tip.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {book.forYou?.length > 0 && (
        <section
          className={`detail-section${book.readingTips?.length > 0 ? "" : " detail-section--tint"}`}
        >
          <div className="container">
            <p className="lbl">This Is For You If</p>
            <div className="for-you-grid">
              {book.forYou.map((t) => (
                <div className="for-you-card" key={t}>{t}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="detail-section detail-section--tint">
        <div className="container">
          <p className="lbl">What Readers Say</p>
          <ReviewSection
            rating={book.rating}
            reviews={book.reviews || []}
            formPrompt="Which part stayed with you?"
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
