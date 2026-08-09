"use client";

import { useEffect, useState } from "react";

export default function Reviews({ testimonials = [], lede = "" }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || isPaused) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const select = (index) => setActive(index);
  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow eyebrow--dark">Reader Voices</p>
          <h2>Reviews</h2>
          <p className="section-lede">{lede || "Sample entries below — swap in real reader reviews and names."}</p>
        </div>

        <div
          className="testimonial-slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
          }}
        >
          <div className="testimonial-track">
            <span className="testimonial-mark" aria-hidden="true">&ldquo;</span>
            {testimonials.map((testimonial, index) => (
              <blockquote
                className={`testimonial${index === active ? " is-active" : ""}`}
                key={testimonial.source + index}
                aria-hidden={index !== active}
              >
                <p>{testimonial.quote}</p>
                <footer>{testimonial.source}</footer>
              </blockquote>
            ))}
          </div>

          <div className="testimonial-dots" role="tablist" aria-label="Testimonial selector">
            {testimonials.map((testimonial, index) => (
              <button
                type="button"
                key={testimonial.source + index}
                role="tab"
                aria-selected={index === active}
                aria-label={`Show review ${index + 1}`}
                className={index === active ? "is-active" : ""}
                onClick={() => select(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
