"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK_IMAGE = "/images/logo/logo-charcoal-bg.png";

export default function Hero({ slides = [], autoplayMs = 6500, lede = "" }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const go = (i) => setActive((i + slides.length) % slides.length);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    timerRef.current = setInterval(() => {
      setActive((v) => (v + 1) % slides.length);
    }, autoplayMs);
    return () => clearInterval(timerRef.current);
  }, [autoplayMs, slides.length]);

  const restart = (fn) => {
    clearInterval(timerRef.current);
    fn();
  };

  if (!slides.length) {
    return (
      <section className="hero" id="hero" aria-label="Featured works">
        <div className="hero-slider">
          <article className="slide is-active">
            <div
              className="slide-bg"
              style={{ backgroundImage: `url(${FALLBACK_IMAGE})` }}
            />
            <div className="slide-overlay" />
            <div className="container slide-content">
              <p className="slide-type">Coming Soon</p>
              <h1 className="slide-title slide-title--always">New stories are on their way</h1>
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" id="hero" aria-label="Featured works">
      <div className="hero-slider">
        {slides.map((book, i) => (
          <article
            key={book.slug}
            className={`slide${i === active ? " is-active" : ""}`}
            aria-hidden={i !== active}
          >
            <div
              className="slide-bg"
              style={{ backgroundImage: `url(${book.hero || book.cover || FALLBACK_IMAGE})` }}
            />
            <div className="slide-overlay" />
            <div className="container slide-content">
              {lede && <p className="slide-lede">{lede}</p>}
              <p className="slide-type">{book.typeLabel}</p>
              <h1 className="slide-title">{book.title}</h1>
              <div className="slide-actions">
                <a href={`/novels/${book.slug}`} className="btn btn-primary">
                  Read / Download PDF
                </a>
                <a href="/#episodic" className="btn btn-outline">
                  Browse All Books
                </a>
              </div>
            </div>
          </article>
        ))}

        <button
          className="slider-arrow slider-arrow--prev"
          aria-label="Previous slide"
          onClick={() => restart(() => go(active - 1))}
        >
          ‹
        </button>
        <button
          className="slider-arrow slider-arrow--next"
          aria-label="Next slide"
          onClick={() => restart(() => go(active + 1))}
        >
          ›
        </button>

        <div className="slider-dots" role="tablist" aria-label="Slide selector">
          {slides.map((book, i) => (
            <button
              key={book.slug}
              role="tab"
              aria-selected={i === active}
              aria-label={`Show ${book.title}`}
              className={i === active ? "is-active" : ""}
              onClick={() => restart(() => go(i))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
