"use client";

import { useEffect, useRef, useState } from "react";

export default function CollectionHeroSlider({ collection, slides = [] }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const activeSlide = slides[active] || slides[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    timerRef.current = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timerRef.current);
  }, [slides.length]);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  const go = (index) => {
    window.clearInterval(timerRef.current);
    setActive((index + slides.length) % slides.length);
  };

  return (
    <section className="collection-hero">
      {slides.map((book, index) => (
        <img
          key={`${book.slug}-blur`}
          className={`collection-hero-image-blur${index === active ? " is-active" : ""}`}
          src={book.hero || book.cover}
          alt=""
          aria-hidden="true"
        />
      ))}
      {slides.map((book, index) => (
        <img
          key={book.slug}
          className={`collection-hero-image${index === active ? " is-active" : ""}`}
          src={book.hero || book.cover}
          alt=""
          aria-hidden={index !== active}
        />
      ))}
      <div className="collection-hero-overlay" />
      <div className="container collection-hero-inner">
        <div className="collection-hero-copy">
          <p className="collection-hero-type">{collection.eyebrow}</p>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
          <div className="collection-hero-actions">
            {activeSlide && <a className="btn btn-primary" href={`/novels/${activeSlide.slug}`}>Read / Download PDF</a>}
            <a className="btn btn-outline" href="#collection-books">Browse the collection</a>
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="collection-hero-dots" role="tablist" aria-label={`${collection.title} slides`}>
          {slides.map((book, index) => (
            <button
              key={book.slug}
              role="tab"
              aria-selected={index === active}
              aria-label={`Show ${book.title}`}
              className={index === active ? "is-active" : ""}
              onClick={() => go(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
