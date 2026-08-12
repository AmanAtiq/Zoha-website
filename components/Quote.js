"use client";

import { useEffect, useState } from "react";

function hasUrdu(text) {
  return /[\u0600-\u06FF]/.test(String(text || ""));
}

function QuoteLines({ text }) {
  const lines = String(text || "").split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

function QuoteSlide({ quote }) {
  const urField = String(quote.ur || "").trim();
  const enField = String(quote.en || quote.text || "").trim();

  // Any Urdu script uses the About Nastaliq face — even if pasted into English.
  let ur = urField;
  let en = enField;
  if (!ur && hasUrdu(enField)) {
    ur = enField;
    en = "";
  } else if (ur && en && ur === en) {
    en = "";
  }

  return (
    <>
      {ur && (
        <p className="quote-ur" lang="ur" dir="rtl">
          <QuoteLines text={ur} />
        </p>
      )}
      {en && (
        <p className={ur ? "quote-en" : "quote-en quote-en--solo"}>
          <QuoteLines text={en} />
        </p>
      )}
      <cite>{quote.cite || "— Zoha Asif"}</cite>
    </>
  );
}

export default function Quote({ quotes = [], text, cite }) {
  const items =
    quotes?.length > 0
      ? quotes.filter((quote) => quote.active !== false)
      : [
          {
            text: text || "Their pain matters, their story matters —\nand they are never alone.",
            cite: cite || "— Zoha Asif",
          },
        ];

  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || isPaused) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused, items.length]);

  useEffect(() => {
    setActive(0);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <section
      className="quote-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="container">
        <div className="quote-slider">
          {items.map((quote, index) => (
            <blockquote
              key={index}
              className={`quote-slide${index === active ? " is-active" : ""}`}
              aria-hidden={index !== active}
            >
              <QuoteSlide quote={quote} />
            </blockquote>
          ))}
        </div>

        {items.length > 1 && (
          <div className="quote-dots" role="tablist" aria-label="Quote selector">
            {items.map((_, index) => (
              <button
                type="button"
                key={index}
                role="tab"
                aria-selected={index === active}
                aria-label={`Show quote ${index + 1}`}
                className={index === active ? "is-active" : ""}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
