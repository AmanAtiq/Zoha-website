"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [note, setNote] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setNote("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setNote(data.error || "Could not subscribe right now. Please try again.");
        return;
      }

      setStatus("success");
      setNote(data.message || "Thanks — you're on the list for new episodes and updates.");
      setEmail("");
    } catch {
      setStatus("error");
      setNote("Network error. Please check your connection and try again.");
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              disabled={status === "loading"}
            />
            <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {note && (
            <p
              className={`newsletter-note${status === "error" ? " newsletter-note--error" : ""}`}
              aria-live="polite"
            >
              {note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
