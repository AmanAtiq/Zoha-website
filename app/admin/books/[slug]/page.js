"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../lib/admin-client";
import BookEditorForm from "../../../../components/admin/BookEditorForm";
import { Alert } from "../../../../components/admin/fields";

export default function EditBookPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/admin/books/${slug}`)
      .then((data) => setBook(data.book))
      .catch((err) => {
        if (err.name === "AuthError") return router.replace("/admin");
        setError(err.message);
      });
  }, [slug, router]);

  if (error) {
    return (
      <>
        <div className="adm-topbar"><h1>Book</h1></div>
        <Alert>{error}</Alert>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <div className="adm-topbar"><h1>Book</h1></div>
        <div className="adm-empty">Loading…</div>
      </>
    );
  }

  return (
    <>
      <div className="adm-topbar">
        <div>
          <h1>Edit — {book.title}</h1>
          <div className="adm-sub">Type, PDF, tags, description and everything else.</div>
        </div>
        <a className="adm-btn adm-btn-ghost" href={`/novels/${book.slug}`} target="_blank" rel="noreferrer">View on site ↗</a>
      </div>
      <BookEditorForm initialBook={book} />
    </>
  );
}
