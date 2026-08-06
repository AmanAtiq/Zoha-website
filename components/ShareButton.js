"use client";

import { useState } from "react";

export default function ShareButton({ title, text, className = "btn btn-outline-dark" }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <button type="button" className={className} onClick={onShare}>
        Share
      </button>
      {copied && (
        <span className="share-note" aria-live="polite">Link copied</span>
      )}
    </span>
  );
}
