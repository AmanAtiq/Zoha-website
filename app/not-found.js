export default function NotFound() {
  return (
    <main>
      <section className="section not-found-section">
        <div className="container not-found-inner">
          <p className="eyebrow eyebrow--dark">404</p>
          <h1>This page has wandered off.</h1>
          <p className="section-lede">
            The page you're looking for doesn't exist, or the story hasn't
            been published here yet.
          </p>
          <a href="/" className="btn btn-primary">
            Back to Home
          </a>
        </div>
      </section>
    </main>
  );
}
