"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, slugify } from "../../../lib/admin-client";
import {
  Alert,
  Field,
  TextInput,
  TextArea,
  Toggle,
  ListEditor,
  ImageField,
  Select,
  Pending,
} from "../../../components/admin/fields";

const emptyNew = () => ({
  title: "",
  titleUrdu: "",
  slug: "",
  type: "short-novel",
  cover: "",
  badge: "Preorder",
  tagline: "",
  description: "",
  price: "",
  isComingSoon: true,
  showOnStore: true,
  note: "",
  pitch: "",
  points: [],
});

export default function AdminPrebookingPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingSlug, setSavingSlug] = useState(null);
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState(emptyNew);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const data = await api("/api/admin/prebooking");
      setItems(data.items);
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

  const updateEdition = (slug, patch) =>
    setItems((prev) => prev.map((item) => (item.book.slug === slug ? { ...item, edition: { ...item.edition, ...patch } } : item)));

  const save = async (item) => {
    setSavingSlug(item.book.slug);
    setError("");
    setNotice("");
    try {
      await api(`/api/admin/prebooking/${item.book.slug}`, {
        method: "PUT",
        body: JSON.stringify({ edition: item.edition }),
      });
      setNotice(`${item.book.title} saved.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSlug(null);
    }
  };

  const createPrebook = async () => {
    setCreating(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...newItem,
        slug: newItem.slug || slugify(newItem.title),
        price: newItem.isComingSoon ? null : Number(newItem.price) || 0,
      };
      const { item, warning } = await api("/api/admin/prebooking", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setItems((prev) => [item, ...prev]);
      setExpandedSlug(item.book.slug);
      setShowAdd(false);
      setNewItem(emptyNew());
      setNotice(warning ? `Prebook added. ${warning}` : `${item.book.title} added as prebook-only.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deletePrebook = async (item) => {
    const isOnly = item.book.prebookOnly;
    if (!isOnly) {
      setError(
        `“${item.book.title}” is a full site book. Turn off “Show on prebooking store” to hide it, or delete it from Books.`
      );
      return;
    }
    if (!window.confirm(`Delete “${item.book.title}”? This removes it from the prebooking store permanently.`)) {
      return;
    }

    setSavingSlug(item.book.slug);
    setError("");
    setNotice("");
    try {
      await api(`/api/admin/prebooking/${item.book.slug}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.book.slug !== item.book.slug));
      if (expandedSlug === item.book.slug) setExpandedSlug(null);
      setNotice(`${item.book.title} deleted.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSlug(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="adm-topbar"><h1>Prebooking</h1></div>
        <div className="adm-empty">Loading…</div>
      </>
    );
  }

  return (
    <>
      <div className="adm-topbar">
        <div>
          <h1>Prebooking</h1>
          <div className="adm-sub">Set prices for existing books, or add titles that only appear in the prebooking store.</div>
        </div>
        <div className="adm-topbar-actions">
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => { setShowAdd(true); setError(""); setNotice(""); }}>
            + Add prebook
          </button>
        </div>
      </div>

      <Pending busy={savingSlug || creating} text={creating ? "Creating…" : "Saving…"} />
      {error && <Alert>{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      {showAdd && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>New prebook-only title</h2>
            <p>Creates a store listing without adding the book to reading collections on the site.</p>
          </div>
          <div className="adm-card-body">
            <div className="adm-grid-2">
              <TextInput
                label="Title"
                value={newItem.title}
                onChange={(e) => setNewItem((n) => ({
                  ...n,
                  title: e.target.value,
                  slug: n.slug || slugify(e.target.value),
                }))}
              />
              <TextInput
                label="Title (Urdu)"
                value={newItem.titleUrdu}
                onChange={(e) => setNewItem((n) => ({ ...n, titleUrdu: e.target.value }))}
                dir="rtl"
              />
            </div>
            <div className="adm-grid-2">
              <TextInput
                label="Slug"
                value={newItem.slug}
                onChange={(e) => setNewItem((n) => ({ ...n, slug: e.target.value }))}
              />
              <Select
                label="Type"
                value={newItem.type}
                onChange={(e) => setNewItem((n) => ({ ...n, type: e.target.value }))}
                options={[
                  { value: "short-novel", label: "Short Novel" },
                  { value: "episodic", label: "Episodic Novel" },
                  { value: "afsana", label: "Afsana" },
                ]}
              />
            </div>
            <ImageField
              label="Cover"
              value={newItem.cover}
              onChange={(url) => setNewItem((n) => ({ ...n, cover: url }))}
            />
            <TextArea
              label="Pitch"
              rows={2}
              value={newItem.pitch}
              onChange={(e) => setNewItem((n) => ({ ...n, pitch: e.target.value }))}
            />
            <div className="adm-grid-2">
              <Toggle
                label="Coming soon"
                hint="Hide the price and disable ordering."
                checked={newItem.isComingSoon}
                onChange={(v) => setNewItem((n) => ({ ...n, isComingSoon: v }))}
              />
              <Toggle
                label="Show on prebooking store"
                checked={newItem.showOnStore}
                onChange={(v) => setNewItem((n) => ({ ...n, showOnStore: v }))}
              />
            </div>
            <div className="adm-grid-2">
              <Field label="Price (PKR)">
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  disabled={newItem.isComingSoon}
                  value={newItem.isComingSoon ? "" : newItem.price}
                  placeholder={newItem.isComingSoon ? "Coming soon" : "e.g. 1450"}
                  onChange={(e) => setNewItem((n) => ({ ...n, price: e.target.value }))}
                />
              </Field>
              <TextInput
                label="Note"
                value={newItem.note}
                onChange={(e) => setNewItem((n) => ({ ...n, note: e.target.value }))}
              />
            </div>
            <Field label="Selling points">
              <ListEditor
                items={newItem.points}
                onChange={(points) => setNewItem((n) => ({ ...n, points }))}
                placeholder="e.g. Limited first print"
              />
            </Field>
            <div className="adm-actions">
              <button type="button" className="adm-btn adm-btn-primary" disabled={creating || !newItem.title} onClick={createPrebook}>
                {creating ? "Creating…" : "Create prebook"}
              </button>
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {items.map(({ book, edition }) => {
        const comingSoon = edition.isComingSoon;
        const expanded = expandedSlug === book.slug;
        return (
          <div className={`adm-card adm-prebooking-card${expanded ? " is-expanded" : ""}`} key={book.slug}>
            <div className="adm-prebooking-summary" role="button" tabIndex={0} aria-expanded={expanded} onClick={() => setExpandedSlug(expanded ? null : book.slug)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedSlug(expanded ? null : book.slug); } }}>
              <div className="adm-media-row">
                {book.cover && <img className="adm-thumb" src={book.cover} alt="" />}
                <div>
                  <strong>{book.title}</strong>
                  <div className="adm-comment-meta">
                    {book.type_label}
                    {book.prebookOnly ? " · Prebook only" : ""}
                  </div>
                </div>
              </div>
              <div className="adm-prebooking-summary-meta">
                <span className={`adm-prebooking-status${comingSoon ? " is-coming-soon" : ""}`}>{comingSoon ? "Coming soon" : "Prebooking"}</span>
                <strong>{comingSoon ? "No price" : `PKR ${Number(edition.price || 0).toLocaleString()}`}</strong>
                <span className="adm-prebooking-chevron" aria-hidden="true">⌄</span>
              </div>
              <div className="adm-actions" onClick={(e) => e.stopPropagation()}>
                <button className="adm-btn adm-btn-primary adm-btn-sm" disabled={savingSlug === book.slug} onClick={() => save({ book, edition })}>Save</button>
                <a className="adm-btn adm-btn-ghost adm-btn-sm" href={`/prebooking/${book.slug}`} target="_blank" rel="noreferrer">View</a>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  disabled={savingSlug === book.slug}
                  onClick={() => deletePrebook({ book, edition })}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="adm-prebooking-body">
            <div className="adm-grid-2">
              <Toggle
                label="Coming soon"
                hint="Hide the price and disable ordering for this title."
                checked={comingSoon}
                onChange={(v) => updateEdition(book.slug, { isComingSoon: v, status: v ? "coming-soon" : "prebooking", price: v ? null : edition.price })}
              />
              <Toggle
                label="Show on prebooking store"
                checked={edition.showOnStore}
                onChange={(v) => updateEdition(book.slug, { showOnStore: v })}
              />
            </div>

            <div className="adm-grid-3">
              <Field label="Price (PKR)">
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  disabled={comingSoon}
                  value={comingSoon ? "" : edition.price ?? ""}
                  placeholder={comingSoon ? "Coming soon" : "e.g. 1450"}
                  onChange={(e) => updateEdition(book.slug, { price: Number(e.target.value) })}
                />
              </Field>
              <TextInput label="Note" value={edition.note} onChange={(e) => updateEdition(book.slug, { note: e.target.value })} />
            </div>
            <TextArea label="Pitch" rows={2} value={edition.pitch} onChange={(e) => updateEdition(book.slug, { pitch: e.target.value })} />
            <Field label="Selling points">
              <ListEditor items={edition.points} onChange={(points) => updateEdition(book.slug, { points })} placeholder="e.g. Limited first print" />
            </Field>
            </div>
          </div>
        );
      })}
    </>
  );
}
