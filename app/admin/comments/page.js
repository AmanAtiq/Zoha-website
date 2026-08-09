"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/admin-client";
import { Alert } from "../../../components/admin/fields";

export default function AdminCommentsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [bookOptions, setBookOptions] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const data = await api("/api/admin/reviews");
      setReviews(data.reviews);
      setBookOptions(data.bookOptions || []);
    } catch (err) {
      if (err.name === "AuthError") return router.replace("/admin");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeReview = async (r) => {
    setBusyId(r.id);
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = reviews.filter((r) => (bookFilter ? r.bookSlug === bookFilter : true));

  return (
    <>
      <div className="adm-topbar">
        <div>
          <h1>Comments & reviews</h1>
          <div className="adm-sub">Every reader comment on the site — delete any of them.</div>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <div className="adm-empty">Loading…</div>
      ) : (
        <>
          <div className="adm-filter-bar">
            <select className="adm-select adm-comments-filter" value={bookFilter} onChange={(e) => setBookFilter(e.target.value)}>
              <option value="">All books</option>
              {bookOptions.map((book) => (
                <option key={book.slug} value={book.slug}>{book.title}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="adm-card"><div className="adm-empty">No comments yet.</div></div>
          ) : (
            <div>
              {filtered.map((r) => (
                <div className="adm-comment" key={r.id}>
                  <div className="adm-comment-head">
                    <strong>{r.name}</strong>
                    <span>{"★".repeat(r.rating)}</span>
                    {r.bookTitle && <span className="adm-badge">{r.bookTitle}</span>}
                    <span className="adm-comment-meta">{r.when}</span>
                    <span className="adm-actions adm-actions-end">
                      <button className="adm-btn adm-btn-danger adm-btn-sm" disabled={busyId === r.id} onClick={() => removeReview(r)}>
                        Delete
                      </button>
                    </span>
                  </div>
                  <p className="adm-comment-text">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
