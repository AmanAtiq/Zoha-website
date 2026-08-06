"use client";

import { useState } from "react";

export default function Newsletter() {
  const [note, setNote] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Static frontend-lock milestone — wire up to the real subscriber
    // list once the backend / newsletter tool is confirmed (SOW 6.2).
    setNote("Thanks — you're on the list for new episodes and updates.");
    e.target.reset();
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="container newsletter-inner">
        <div className="newsletter-copy">
          <p className="eyebrow">Stay In The Story</p>
          <h2>Join the Newsletter</h2>
          <p>New episodes and story updates, straight to your inbox.</p>
        </div>

        <div>
          <form className="newsletter-form" onSubmit={onSubmit}>
            <label htmlFor="newsletterEmail" className="sr-only">
              Email address
            </label>
            <input
              type="email"
              id="newsletterEmail"
              name="email"
              placeholder="Your email address"
              required
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
          <p className="newsletter-note" aria-live="polite">{note}</p>
        </div>
      </div>
    </section>
  );
}
