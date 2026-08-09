export default function MoreFromAuthor({ more = [] }) {
  const items = more;
  if (items.length === 0) return null;

  return (
    <section className="detail-section">
      <div className="container">
        <p className="lbl">More From Zoha Asif</p>
        <div className="more-grid">
          {items.map((b) => (
            <a href={`/novels/${b.slug}`} className="more-card" key={b.slug}>
              <div className="more-cover">
                <img src={b.cover} alt={`${b.title} cover`} />
              </div>
              <div className="more-title">{b.title}</div>
              <div className="more-type">{b.typeLabel}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}