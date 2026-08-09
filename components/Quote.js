export default function Quote({ text, cite }) {
  const lines = (text || "Their pain matters, their story matters —\nand they are never alone.").split("\n");

  return (
    <section className="quote-section">
      <div className="container">
        <blockquote>
          <p>
            &ldquo;{lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}&rdquo;
          </p>
          <cite>{cite || "— Zoha Asif"}</cite>
        </blockquote>
      </div>
    </section>
  );
}
