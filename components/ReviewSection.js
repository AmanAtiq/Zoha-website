"use client";

import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import RatingBars from "./RatingBars";

function formatRelativeTime(createdAt, now) {
  if (!createdAt || !now) return "";

  const seconds = Math.floor((now - new Date(createdAt).getTime()) / 1000);
  if (!Number.isFinite(seconds) || seconds < 60) return "Just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ReviewSection({ rating, reviews: initialReviews, formPrompt, bookSlug, episodeSlug }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [now, setNow] = useState(0);
  const [sel, setSel] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    setNotice("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSlug,
          episodeSlug,
          name: name.trim() || "Reader",
          rating: sel || 5,
          text: trimmed,
        }),
      });
      if (res.ok) {
        const { review } = await res.json();
        setNow(Date.now());
        setReviews((current) => [review, ...current]);
        setNotice("Thanks! Your review is now live on this page.");
        setName("");
        setText("");
        setSel(0);
      } else {
        setNotice("Something went wrong — please try again.");
      }
    } catch {
      setNotice("Something went wrong — please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      {rating && (
        <div className="rating-summary">
          <div className="rating-avg">
            <div className="rating-avg-num">{rating.avg.toFixed(1)}</div>
            <StarRating value={rating.avg} size="0.85rem" />
            <div className="rating-avg-count">{rating.count.toLocaleString()} reviews</div>
          </div>
          <RatingBars dist={rating.dist} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="review-empty">
          No reviews yet — be the first to read this one and share what you thought.
        </p>
      ) : (
        <div>
          {reviews.map((r, i) => (
            <div className="review-card" key={`${r.name}-${r.when}-${i}`}>
              <div className="review-head">
                <span className="review-avatar" aria-hidden="true">
                  {r.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="review-name">{r.name}</span>
                <StarRating value={r.rating} size="0.75rem" />
                <span className="review-when">{formatRelativeTime(r.createdAt, now) || r.when}</span>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <form className="review-form" onSubmit={onSubmit}>
        <div className="review-form-label">Leave a review</div>
        <div className="star-picker" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              type="button"
              key={i}
              className={i <= sel ? "is-active" : ""}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              aria-pressed={i <= sel}
              onClick={() => setSel(i)}
            >
              ★
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="reviewerName">Your name</label>
        <input
          id="reviewerName"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="sr-only" htmlFor="reviewerText">Review</label>
        <textarea
          id="reviewerText"
          rows={3}
          placeholder={formPrompt || "What did you think?"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="review-form-footer">
          <span className="review-form-note">{notice || "Your review appears on the site right away"}</span>
          <button type="submit" className="btn btn-primary" disabled={posting}>{posting ? "Posting…" : "Post review"}</button>
        </div>
      </form>
    </div>
  );
}
