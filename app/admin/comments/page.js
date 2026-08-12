"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/admin-client";
import { Alert, TextInput, TextArea, Select, Field } from "../../../components/admin/fields";

const emptyForm = () => ({
  id: null,
  bookSlug: "",
  episodeSlug: "",
  name: "",
  rating: 5,
  text: "",
  when: "Just now",
});

export default function AdminCommentsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [bookOptions, setBookOptions] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

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
    if (!window.confirm("Delete this comment?")) return;
    setBusyId(r.id);
    setError("");
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((x) => x.id !== r.id));
      if (form?.id === r.id) setForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const startAdd = () => {
    setError("");
    setNotice("");
    setForm({
      ...emptyForm(),
      bookSlug: bookFilter || bookOptions[0]?.slug || "",
    });
  };

  const startEdit = (r) => {
    setError("");
    setNotice("");
    setForm({
      id: r.id,
      bookSlug: r.bookSlug || "",
      episodeSlug: r.episodeSlug || "",
      name: r.name || "",
      rating: r.rating || 5,
      text: r.text || "",
      when: r.when || "",
    });
  };

  const saveForm = async () => {
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        bookSlug: form.bookSlug,
        episodeSlug: form.episodeSlug || null,
        name: form.name,
        rating: Number(form.rating) || 5,
        text: form.text,
        when: form.when,
      };
      if (form.id) {
        const { review } = await api(`/api/admin/reviews/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const bookTitle = bookOptions.find((b) => b.slug === review.bookSlug)?.title || "";
        const episodeTitle = bookOptions
          .find((b) => b.slug === review.bookSlug)
          ?.episodes?.find((ep) => ep.slug === review.episodeSlug)?.title || "";
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...review, bookTitle: bookTitle || r.bookTitle, episodeTitle } : r))
        );
        setNotice("Comment updated.");
      } else {
        const { review } = await api("/api/admin/reviews", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const bookTitle = bookOptions.find((b) => b.slug === review.bookSlug)?.title || "";
        const episodeTitle = bookOptions
          .find((b) => b.slug === review.bookSlug)
          ?.episodes?.find((ep) => ep.slug === review.episodeSlug)?.title || "";
        setReviews((prev) => [{ ...review, bookTitle, episodeTitle }, ...prev]);
        setNotice("Comment added.");
      }
      setForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = reviews.filter((r) => (bookFilter ? r.bookSlug === bookFilter : true));
  const selectedBook = bookOptions.find((book) => book.slug === form?.bookSlug);
  const episodeOptions = selectedBook?.episodes || [];

  return (
    <>
      <div className="adm-topbar">
        <div>
          <h1>Comments & reviews</h1>
          <div className="adm-sub">Add, edit, or delete reader comments on any book.</div>
        </div>
        <div className="adm-topbar-actions">
          <button className="adm-btn adm-btn-primary" type="button" onClick={startAdd}>
            + Add comment
          </button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      {form && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>{form.id ? "Edit comment" : "New comment"}</h2>
            <p>Shown on the book&apos;s reviews section on the public site.</p>
          </div>
          <div className="adm-card-body">
            <div className="adm-grid-2">
              <Select
                label="Book"
                value={form.bookSlug}
                onChange={(e) => setForm((f) => ({ ...f, bookSlug: e.target.value, episodeSlug: "" }))}
                options={bookOptions.map((b) => ({ value: b.slug, label: b.title }))}
              />
              <TextInput
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Reader name"
              />
            </div>
            <div className="adm-grid-2">
              <Field label="Rating">
                <select
                  className="adm-select"
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} ★</option>
                  ))}
                </select>
              </Field>
              <TextInput
                label="When (display)"
                value={form.when}
                onChange={(e) => setForm((f) => ({ ...f, when: e.target.value }))}
                placeholder="e.g. 2 days ago"
              />
            </div>
            {episodeOptions.length > 0 && (
              <Select
                label="Review location"
                value={form.episodeSlug || ""}
                onChange={(e) => setForm((f) => ({ ...f, episodeSlug: e.target.value }))}
                options={[
                  { value: "", label: "Whole novel" },
                  ...episodeOptions.map((ep) => ({
                    value: ep.slug,
                    label: `Episode ${String(ep.episodeNumber || "").padStart(2, "0")} · ${ep.title}`,
                  })),
                ]}
              />
            )}
            <TextArea
              label="Comment"
              rows={4}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            />
            <div className="adm-actions">
              <button className="adm-btn adm-btn-primary" type="button" disabled={saving} onClick={saveForm}>
                {saving ? "Saving…" : form.id ? "Save changes" : "Add comment"}
              </button>
              <button className="adm-btn adm-btn-ghost" type="button" onClick={() => setForm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {r.episodeSlug && <span className="adm-badge adm-badge-muted">{r.episodeTitle || r.episodeSlug}</span>}
                    <span className="adm-comment-meta">{r.when}</span>
                    <span className="adm-actions adm-actions-end">
                      <button className="adm-btn adm-btn-outline adm-btn-sm" type="button" onClick={() => startEdit(r)}>
                        Edit
                      </button>
                      <button className="adm-btn adm-btn-danger adm-btn-sm" type="button" disabled={busyId === r.id} onClick={() => removeReview(r)}>
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
