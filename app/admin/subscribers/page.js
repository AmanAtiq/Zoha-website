"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/admin-client";
import { Alert, Field } from "../../../components/admin/fields";

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const data = await api("/api/admin/subscribers");
      setSubscribers(data.subscribers || []);
      if (data.dbNotice) {
        setError(`Supabase Notice: ${data.dbNotice}. Make sure the 'subscribers' table is created in Supabase SQL editor.`);
      }
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    setAdding(true);
    setError("");
    try {
      const res = await api("/api/admin/subscribers", {
        method: "POST",
        body: JSON.stringify({ email: newEmail }),
      });
      setSubscribers((prev) => [res.subscriber, ...prev.filter((s) => s.email !== res.subscriber.email)]);
      setNewEmail("");
      setNotice("Subscriber added successfully.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove "${email}" from the subscriber list?`)) return;
    setBusyId(id);
    setError("");
    try {
      await api(`/api/admin/subscribers/${id}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setNotice("Subscriber removed.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export.");
      return;
    }
    const headers = ["Email", "Source", "Status", "Subscribed At"];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.source || "website"}"`,
      `"${s.status || "active"}"`,
      `"${s.createdAt ? new Date(s.createdAt).toISOString() : ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zoha-asif-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div>
      <div className="adm-topbar">
        <div>
          <h1>Newsletter Subscribers</h1>
          <p className="adm-sub">
            Manage readers who joined your newsletter, export the list, and send broadcasts.
          </p>
        </div>
        <div className="adm-actions">
          <button
            type="button"
            className="adm-btn adm-btn-outline"
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
          >
            Export CSV ({subscribers.length})
          </button>
          <a
            href="https://resend.com/broadcasts"
            target="_blank"
            rel="noreferrer"
            className="adm-btn adm-btn-primary"
          >
            Send Broadcast Letter ↗
          </a>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      {/* Broadcast / ESP Integration Card */}
      <div className="adm-card">
        <div className="adm-media-row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2>Email Broadcasts (ESP Setup)</h2>
            <p className="adm-card-hint" style={{ marginBottom: 0 }}>
              Your site syncs new subscribers into your Supabase database and automatically to <strong>Resend Audiences</strong>.
              You can compose rich letters and send weekly updates with 1-click in Resend.
            </p>
          </div>
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noreferrer"
            className="adm-btn adm-btn-outline adm-btn-sm"
          >
            View Resend Audience ↗
          </a>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="adm-stat-grid">
        <div className="adm-stat">
          <span>Total Subscribers</span>
          <strong>{subscribers.length}</strong>
        </div>
        <div className="adm-stat">
          <span>Active Readers</span>
          <strong>{subscribers.filter((s) => s.status === "active").length}</strong>
        </div>
      </div>

      {/* Add subscriber form */}
      <div className="adm-card">
        <h2>Add Subscriber Manually</h2>
        <p className="adm-card-hint">Manually add a reader’s email address to your subscriber list.</p>
        <form onSubmit={handleAdd} className="adm-media-row" style={{ gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Field label="Email Address">
              <input
                type="email"
                className="adm-input"
                placeholder="reader@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </Field>
          </div>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={adding} style={{ marginBottom: 16 }}>
            {adding ? "Adding…" : "+ Add Subscriber"}
          </button>
        </form>
      </div>

      {/* Subscriber List Table */}
      <div className="adm-card adm-card-table">
        <div style={{ padding: "16px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Reader List ({filtered.length})</h2>
          <div className="adm-search" style={{ margin: 0 }}>
            <input
              className="adm-input adm-search-input"
              placeholder="Search subscriber by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="adm-empty">Loading subscribers…</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <p>{search ? "No subscribers match your search." : "No newsletter subscribers yet."}</p>
            <small>When visitors submit the form on the homepage, they will appear here automatically.</small>
          </div>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Subscribed Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id || sub.email}>
                    <td>
                      <strong>{sub.email}</strong>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-muted">{sub.source || "website"}</span>
                    </td>
                    <td style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "—"}
                    </td>
                    <td>
                      <span className={`adm-badge ${sub.status === "active" ? "adm-badge-success" : "adm-badge-pending"}`}>
                        {sub.status || "active"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        disabled={busyId === sub.id}
                        onClick={() => handleDelete(sub.id, sub.email)}
                      >
                        {busyId === sub.id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
