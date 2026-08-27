"use client";

import { useState } from "react";

export default function ReadDownloadButton({
  href,
  comingSoon,
  label = "Read PDF",
  downloadLabel = "Download PDF",
  className = "btn btn-primary",
  downloadClassName = "btn btn-outline-dark",
  bookSlug,
  episodeSlug,
  showStats = false,
  stats,
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [localStats, setLocalStats] = useState(stats || null);

  const trackClick = (action) => {
    if (!bookSlug) return;
    fetch("/api/read-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookSlug, episodeSlug, action }),
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) setLocalStats(data.stats);
      })
      .catch(() => {});
  };

  const downloadHref = href
    ? href.includes("/storage/v1/object/public/") && !href.includes("download")
      ? `${href}${href.includes("?") ? "&" : "?"}download`
      : href
    : href;

  if (!comingSoon) {
    return (
      <span className="read-download-wrap">
        <span className="read-download-actions">
          <a href={href} target="_blank" rel="noreferrer" className={className} onClick={() => trackClick("read")}>
            {label}
          </a>
          <a href={downloadHref} download className={downloadClassName} onClick={() => trackClick("download")}>
            {downloadLabel}
          </a>
        </span>
        {showStats && localStats && (
          <span className="read-download-stats">
            {Number(localStats.readCount || 0).toLocaleString()} reads / {Number(localStats.downloadCount || 0).toLocaleString()} downloads
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="coming-soon-btn-wrap">
      <button type="button" className={className} onClick={() => setShowMessage(true)}>
        {label}
      </button>
      {showMessage && (
        <span className="coming-soon-note" role="status">
          This one&apos;s coming soon — check back shortly.
        </span>
      )}
    </span>
  );
}
