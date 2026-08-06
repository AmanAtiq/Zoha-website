"use client";

import { useEffect, useRef, useState } from "react";
import { heroSlides } from "../lib/books";

export default function Hero() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const go = (i) => setActive((i + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    timerRef.current = setInterval(() => {
      setActive((v) => (v + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timerRef.current);
  }, []);

  const restart = (fn) => {
    clearInterval(timerRef.current);
    fn();
  };

  return (
    <section className="hero" id="hero" aria-label="Featured works">
      <div className="hero-slider">
        {heroSlides.map((book, i) => (
          <article
            key={book.slug}
            className={`slide${i === active ? " is-active" : ""}`}
            aria-hidden={i !== active}
          >
            <div
              className="slide-bg"
              style={{ backgroundImage: `url(${book.hero})` }}
            />
            <div className="slide-overlay" />
            <div className="container slide-content">
              <p className="slide-type">{book.typeLabel}</p>
              <h1 className="slide-title">{book.title}</h1>
              <div className="slide-actions">
                <a href={`/novels/${book.slug}`} className="btn btn-primary">
                  {book.ctaLabel}
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
          {heroSlides.map((book, i) => (
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
