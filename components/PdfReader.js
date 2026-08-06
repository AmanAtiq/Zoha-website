"use client";

import { useState } from "react";

export default function PdfReader({ pdf, fileLabel = "coming-soon.pdf" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="reader-toggle-wrap">
      <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
        {open ? "Close Reader" : "Read Online"}
      </button>
      {open && (
        <div className="pdf-reader">
          <div className="pdf-reader-bar">
            <span>{fileLabel}</span>
          </div>
          <iframe src={pdf} title={fileLabel} />
        </div>
      )}
    </div>
  );
}
