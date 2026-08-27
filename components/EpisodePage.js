import StarRating from "./StarRating";
import ReviewSection from "./ReviewSection";
import ShareButton from "./ShareButton";
import ReadDownloadButton from "./ReadDownloadButton";

export default function EpisodePage({ book, episode, index }) {
  const epLabel = String(index + 1).padStart(2, "0");
  const comingSoon = book.comingSoon || episode.comingSoon;

  return (
    <main>
      <section className="section episode-breadcrumb-section">
        <div className="container">
          <p className="breadcrumb">
            <a href="/#episodic">Novels</a> ›{" "}
            <a href={`/novels/${book.slug}`}>{book.title}</a> ›{" "}
            <span className="current">Episode {epLabel}</span>
          </p>
        </div>
      </section>

      <section className="section episode-detail-section">
        <div className="container episode-detail-layout">
          <div className="book-detail-cover episode-detail-cover">
            <img src={book.cover} alt={`${book.title} cover`} />
          </div>
          <div className="episode-detail-content">
            <h1 className="episode-heading">
              Episode {epLabel} · {episode.title}
            </h1>
            {comingSoon && <span className="coming-soon-flag">Coming Soon</span>}
            {episode.urduTitle && (
              <p className="episode-title-ur" lang="ur" dir="rtl">{episode.urduTitle}</p>
            )}
            <p className="episode-book-attribution">
              {book.title} · an episodic novel by Zoha Asif
            </p>

            <div className="chip-row episode-statuses">
              {episode.readTime && <span className="chip">{episode.readTime}</span>}
              <span className="chip chip--outline">Urdu</span>
            </div>

            {episode.rating && (
              <div className="book-rating-summary episode-rating-summary">
                <StarRating value={episode.rating.avg} />
                <span className="book-rating-count">
                  {episode.rating.avg.toFixed(1)} · {episode.rating.count.toLocaleString()} reviews
                </span>
              </div>
            )}

            {episode.teaserUr && (
              <div className="excerpt-block episode-teaser">
                <div className="ur" lang="ur" dir="rtl">{episode.teaserUr}</div>
              </div>
            )}

            <p className="detail-prose episode-synopsis">
              {episode.synopsis}
            </p>
            {episode.closingLineUr && (
              <p className="episode-closing-line" lang="ur" dir="rtl">{episode.closingLineUr}</p>
            )}

            <div className="book-detail-actions">
              <ReadDownloadButton
                href={episode.pdf}
                comingSoon={comingSoon}
                bookSlug={book.slug}
                episodeSlug={episode.slug}
                showStats={book.showReadDownloadStats}
                stats={episode.assetStats}
              />
              <ShareButton title={`${book.title} — ${episode.title}`} text={episode.synopsis} />
            </div>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="container">
          <p className="lbl">All Episodes</p>
          <div className="episode-strip">
            {book.episodes.map((ep, i) => (
              <a
                href={`/novels/${book.slug}/${ep.slug}`}
                key={ep.slug}
                className={`episode-card${ep.slug === episode.slug ? " is-current" : ""}`}
              >
                <div className="episode-index">
                  EP {String(i + 1).padStart(2, "0")}
                  {(book.comingSoon || ep.comingSoon) && " · Coming soon"}
                </div>
                <div className="episode-title">{ep.title}</div>
              </a>
            ))}
            {book.moreEpisodesComing && (
              <div className="episode-card episode-card--locked">
                <div className="episode-index">NEXT</div>
                <div className="episode-synopsis">Coming soon</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="detail-section detail-section--tint">
        <div className="container">
          <p className="lbl">About The Novel</p>
          <p className="detail-prose episode-about-prose">
            {book.description}
          </p>
          <div className="chip-row">
            {book.genres.map((g) => (
              <span className="chip" key={g}>{g}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="container">
          <p className="lbl">Reader Reviews</p>
          <ReviewSection
            rating={episode.rating}
            reviews={episode.reviews || []}
            formPrompt="What did this episode leave you with?"
            bookSlug={book.slug}
            episodeSlug={episode.slug}
          />
        </div>
      </section>
    </main>
  );
}
