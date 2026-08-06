const STARS = [5, 4, 3, 2, 1];

export default function RatingBars({ dist }) {
  return (
    <div className="rating-bars">
      {STARS.map((n, i) => (
        <div className="rating-bar-row" key={n}>
          <span className="n">{n}</span>
          <span className="rating-bar-track">
            <span className="rating-bar-fill" style={{ width: `${dist[i]}%` }} />
          </span>
          <span className="pct">{dist[i]}%</span>
        </div>
      ))}
    </div>
  );
}
