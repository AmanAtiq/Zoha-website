import StarRating from "./StarRating";
import ReviewSection from "./ReviewSection";
import PdfReader from "./PdfReader";
import ShareButton from "./ShareButton";

export default function EpisodePage({ book, episode, index }) {
  const epLabel = String(index + 1).padStart(2, "0");

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <p className="breadcrumb">
            <a href="/#episodic">Novels</a> ›{" "}
            <a href={`/novels/${book.slug}`}>{book.title}</a> ›{" "}
            <span className="current">Episode {epLabel}</span>
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div
          className="container"
          style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <div
            className="book-detail-cover"
            style={{ flex: "0 0 220px", width: 220, marginTop: 0 }}
          >
            <img src={book.cover} alt={`${book.title} cover`} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>
              Episode {epLabel} · {episode.title}
            </h1>
            {episode.urduTitle && (
              <p className="episode-title-ur" lang="ur" dir="rtl">{episode.urduTitle}</p>
            )}
            <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "10px 0 14px" }}>
              {book.title} · an episodic novel by Zoha Asif
            </p>

            <div className="chip-row" style={{ marginBottom: 14 }}>
              {episode.readTime && <span className="chip">{episode.readTime}</span>}
              <span className="chip chip--outline">Urdu</span>
            </div>

            {episode.rating && (
              <div
                style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}
              >
                <StarRating value={episode.rating.avg} />
                <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                  {episode.rating.avg.toFixed(1)} · {episode.rating.count.toLocaleString()} reviews
                </span>
              </div>
            )}

            {episode.teaserUr && (
              <div className="excerpt-block" style={{ marginBottom: 16 }}>
                <div className="ur" lang="ur" dir="rtl">{episode.teaserUr}</div>
              </div>
            )}

            <p className="detail-prose" style={{ marginBottom: 8 }}>
              {episode.synopsis}
            </p>
            {episode.closingLineUr && (
              <p className="episode-closing-line" lang="ur" dir="rtl">{episode.closingLineUr}</p>
            )}

            <div className="book-detail-actions">
              <PdfReader pdf={episode.pdf} fileLabel={`${book.slug}-${episode.slug}.pdf`} />
              <a href={episode.pdf} download className="btn btn-outline-dark">
                Download PDF
              </a>
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
                <div className="episode-index">EP {String(i + 1).padStart(2, "0")}</div>
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
          <p className="detail-prose" style={{ marginBottom: 16 }}>
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
          />
        </div>
      </section>
    </main>
  );
}
