"use client";

import { useState } from "react";

export default function ReadDownloadButton({
  href,
  comingSoon,
  label = "Read / Download PDF",
  className = "btn btn-primary",
}) {
  const [showMessage, setShowMessage] = useState(false);

  if (!comingSoon) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
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
