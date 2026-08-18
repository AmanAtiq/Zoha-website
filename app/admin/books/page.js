"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/admin-client";
import { Alert } from "../../../components/admin/fields";

const TYPE_BADGE = {
  episodic: "Episodic",
  "short-novel": "Short Novel",
  afsana: "Afsana",
};

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const data = await api("/api/admin/books");
      setBooks(data.books);
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

  const toggleHome = async (book) => {
    setBusyId(book.slug);
    try {
      await api(`/api/admin/books/${book.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ homeVisible: !book.homeVisible }),
      });
      setBooks((prev) =>
        prev.map((b) => (b.slug === book.slug ? { ...b, homeVisible: !b.homeVisible } : b))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const togglePublished = async (book) => {
    setBusyId(book.slug);
    try {
      await api(`/api/admin/books/${book.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !(book.published ?? true) }),
      });
      setBooks((prev) =>
        prev.map((b) => (b.slug === book.slug ? { ...b, published: !(b.published ?? true) } : b))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleComingSoon = async (book) => {
    setBusyId(book.slug);
    try {
      await api(`/api/admin/books/${book.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ comingSoon: !book.comingSoon }),
      });
      setBooks((prev) =>
        prev.map((b) => (b.slug === book.slug ? { ...b, comingSoon: !b.comingSoon } : b))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeBook = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This also removes its episodes, reviews and prebooking.`)) return;
    try {
      await api(`/api/admin/books/${book.slug}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.slug !== book.slug));
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = books.filter((b) =>
    (b.title + " " + b.slug + " " + b.typeLabel).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="adm-topbar">
        <div>
          <h1>Books</h1>
          <div className="adm-sub">Everything on the site — details, type, PDF, tags, and where it shows.</div>
        </div>
        <a className="adm-btn adm-btn-primary" href="/admin/books/new">+ New book</a>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <div className="adm-empty">Loading…</div>
      ) : (
        <>
          <div className="adm-search">
            <input
              className="adm-input adm-search-input"
              placeholder="Search titles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="adm-card">
              <div className="adm-empty">
                <p>No books found.</p>
                <a className="adm-btn adm-btn-primary" href="/admin/books/new">Add your first book</a>
              </div>
            </div>
          ) : (
            <div className="adm-card adm-card-table">
              <div className="adm-table-wrap">
                <table className="adm-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Episodes</th>
                    <th>Reviews</th>
                    <th>Published</th>
                    <th>Coming soon</th>
                    <th>On homepage</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((book) => (
                    <tr key={book.slug}>
                      <td>{book.cover && <img className="adm-thumb" src={book.cover} alt="" />}</td>
                      <td>
                        <strong>{book.title}</strong>
                        {book.titleUrdu && <div className="adm-comment-meta" dir="rtl" lang="ur">{book.titleUrdu}</div>}
                      </td>
                      <td>
                        <span className={`adm-badge${book.type === "afsana" ? " adm-badge-success" : ""}`}>
                          {book.typeLabel || TYPE_BADGE[book.type]}
                        </span>
                      </td>
                      <td>{book.episodeCount}</td>
                      <td>
                        {book.reviewCount}
                      </td>
                      <td>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={book.published ?? true}
                          className={`adm-toggle${book.published ?? true ? " is-on" : ""}`}
                          disabled={busyId === book.slug}
                          onClick={() => togglePublished(book)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!book.comingSoon}
                          className={`adm-toggle${book.comingSoon ? " is-on" : ""}`}
                          disabled={busyId === book.slug}
                          onClick={() => toggleComingSoon(book)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={book.homeVisible}
                          className={`adm-toggle${book.homeVisible ? " is-on" : ""}`}
                          disabled={busyId === book.slug}
                          onClick={() => toggleHome(book)}
                        />
                      </td>
                      <td>
                        <div className="adm-actions">
                          <a className="adm-btn adm-btn-outline adm-btn-sm" href={`/admin/books/${book.slug}`}>Edit</a>
                          <a className="adm-btn adm-btn-ghost adm-btn-sm" href={`/novels/${book.slug}`} target="_blank" rel="noreferrer">View</a>
                          <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => removeBook(book)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
