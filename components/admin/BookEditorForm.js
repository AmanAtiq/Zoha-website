"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, slugify } from "../../lib/admin-client";
import {
  Alert,
  Field,
  TextInput,
  TextArea,
  Select,
  Toggle,
  ListEditor,
  PairListEditor,
  ImageField,
  FileField,
  Pending,
} from "./fields";

const TYPE_OPTIONS = [
  { value: "episodic", label: "Episodic Novel" },
  { value: "short-novel", label: "Short Novel" },
  { value: "afsana", label: "Afsana" },
];

const TYPE_LABELS = {
  episodic: "Episodic Novel",
  "short-novel": "Short Novel",
  afsana: "Afsana",
};

const DEFAULT_BOOK = {
  slug: "",
  title: "",
  titleUrdu: "",
  type: "short-novel",
  typeLabel: "",
  badge: "",
  cover: "",
  hero: "",
  tagline: "",
  ctaLabel: "",
  pdf: "",
  description: "",
  descriptionUr: "",
  authorNote: "",
  excerpt: { ur: "", source: "", episodeSlug: "" },
  genres: [],
  forYou: [],
  readingTips: [],
  rating: { avg: 0, count: 0, dist: [0, 0, 0, 0, 0] },
  quote: { ur: "", en: "", source: "" },
  moreEpisodesComing: false,
  contentPlaceholder: false,
  placeholderCopy: false,
  homeVisible: true,
  homeOrder: 0,
  published: true,
  comingSoon: false,
};

const normalize = (b) => {
  if (!b) return { ...DEFAULT_BOOK, episodes: [], reviews: [] };
  return {
    ...DEFAULT_BOOK,
    ...b,
    slug: b.slug || "",
    excerpt: b.excerpt || { ur: "", source: "", episodeSlug: "" },
    quote: b.quote || { ur: "", en: "", source: "" },
    rating: b.rating || { avg: 0, count: 0, dist: [0, 0, 0, 0, 0] },
    genres: b.genres || [],
    forYou: b.forYou || [],
    readingTips: b.readingTips || [],
    episodes: b.episodes || [],
    reviews: b.reviews || [],
  };
};

export default function BookEditorForm({ initialBook, isNew }) {
  const router = useRouter();
  const [book, setBook] = useState(() => normalize(initialBook));
  const [episodes, setEpisodes] = useState(book.episodes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("identity");
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const [reviewForm, setReviewForm] = useState(null);
  const [savingReview, setSavingReview] = useState(false);
  const episodeOptions = episodes.map((ep, i) => ({
    value: ep.slug,
    label: `Episode ${String(i + 1).padStart(2, "0")}${ep.title ? ` · ${ep.title}` : ""}`,
  }));

  const set = (patch) => setBook((b) => ({ ...b, ...patch }));

  const setEpisode = (i, patch) =>
    setEpisodes((prev) => prev.map((ep, idx) => (idx === i ? { ...ep, ...patch } : ep)));

  const save = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (isNew) {
        const payload = { ...book };
        if (!payload.slug) payload.slug = slugify(payload.title);
        const { book: created } = await api("/api/admin/books", {
          method: "POST",
          body: JSON.stringify({ book: payload, episodes }),
        });
        router.push(`/admin/books/${created.slug}`);
      } else {
        await api(`/api/admin/books/${book.slug}`, {
          method: "PUT",
          body: JSON.stringify({ book, episodes }),
        });
        setNotice("Saved. Changes are live on the site.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const reviewAction = async (r) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      setBook((b) => ({ ...b, reviews: b.reviews.filter((x) => x.id !== r.id) }));
    } catch (err) {
      setError(err.message);
    }
  };

  const startAddReview = () => {
    setReviewForm({ id: null, episodeSlug: "", name: "", rating: 5, text: "", when: "Just now" });
  };

  const startEditReview = (r) => {
    setReviewForm({
      id: r.id,
      episodeSlug: r.episodeSlug || "",
      name: r.name || "",
      rating: r.rating || 5,
      text: r.text || "",
      when: r.when || "",
    });
  };

  const saveReviewForm = async () => {
    if (!reviewForm) return;
    setSavingReview(true);
    setError("");
    try {
      const payload = {
        bookSlug: book.slug,
        episodeSlug: reviewForm.episodeSlug || null,
        name: reviewForm.name,
        rating: Number(reviewForm.rating) || 5,
        text: reviewForm.text,
        when: reviewForm.when,
      };
      if (reviewForm.id) {
        const { review } = await api(`/api/admin/reviews/${reviewForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setBook((b) => ({
          ...b,
          reviews: b.reviews.map((r) => (r.id === review.id ? review : r)),
        }));
      } else {
        const { review } = await api("/api/admin/reviews", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setBook((b) => ({ ...b, reviews: [review, ...b.reviews] }));
      }
      setReviewForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="adm-book-editor" data-active-tab={activeTab} data-book-type={book.type}>
      {error && <Alert>{error}</Alert>}
      <div className="adm-book-tabs" role="tablist" aria-label="Book editor sections">
        {[["identity", "Identity"], ["media", "Media & placement"], ["content", "Content"], ["ratings", "Ratings & flags"], ["episodes", `Episodes${episodes.length ? ` · ${episodes.length}` : ""}`], ["reviews", `Reviews${book.reviews.length ? ` · ${book.reviews.length}` : ""}`]].filter(([id]) => id !== "episodes" || book.type === "episodic").map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={`adm-book-tab${activeTab === id ? ' is-active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>
      {notice && <Alert kind="success">{notice}</Alert>}
      <Pending busy={saving} text="Saving…" />

      <div className="adm-card" data-book-tab="identity">
        <h2>Identity</h2>
        <p className="adm-card-hint">Title, slug and how the book is categorised on the site.</p>
        <div className="adm-grid-2">
          <TextInput label="Title (English)" value={book.title} onChange={(e) => set({ title: e.target.value })} />
          <TextInput label="Title (Urdu)" value={book.titleUrdu} onChange={(e) => set({ titleUrdu: e.target.value })} dir="rtl" />
        </div>
        <div className="adm-grid-2">
          <Field label="Slug">
            <input
              className="adm-input"
              value={book.slug}
              disabled={!isNew}
              placeholder="url-identifier"
              onChange={(e) => set({ slug: slugify(e.target.value) })}
            />
            {!isNew && <div className="adm-field-hint">Slug is fixed once created — it's the page URL.</div>}
          </Field>
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={book.type}
            onChange={(e) => set({ type: e.target.value, typeLabel: TYPE_LABELS[e.target.value] || book.typeLabel })}
          />
        </div>
        <div className="adm-grid-3">
          <TextInput label="Type label" value={book.typeLabel} placeholder="e.g. Short Novel" onChange={(e) => set({ typeLabel: e.target.value })} />
          <TextInput label="Badge" value={book.badge} placeholder="e.g. New / Complete" onChange={(e) => set({ badge: e.target.value })} />
          <TextInput label="CTA label" value={book.ctaLabel} placeholder="e.g. Read the Story" onChange={(e) => set({ ctaLabel: e.target.value })} />
        </div>
        <Toggle
          label="Published"
          hint="Turn off to keep this title in draft for the author only."
          checked={book.published}
          onChange={(v) => set({ published: v })}
        />
        <TextInput
          label="Tagline"
          value={book.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </div>

      <div className="adm-card" data-book-tab="media">
        <h2>Images & PDF</h2>
        <p className="adm-card-hint">Upload an image or paste an existing path/URL.</p>
        <div className="adm-grid-2">
          <ImageField label="Cover image" value={book.cover} onChange={(url) => set({ cover: url })} />
          <ImageField label="Hero image" value={book.hero} onChange={(url) => set({ hero: url })} wide />
        </div>
        <FileField
          label="PDF (soft copy)"
          hint="Upload a real PDF file for this book."
          value={book.pdf}
          onChange={(url) => set({ pdf: url })}
        />
      </div>

      <div className="adm-card" data-book-tab="media">
        <h2>Homepage placement</h2>
        <p className="adm-card-hint">Whether this title appears in its homepage section, and the order.</p>
        <Toggle
          label="Show on homepage"
          checked={book.homeVisible}
          onChange={(v) => set({ homeVisible: v })}
        />
        <div className="adm-grid-2">
          <TextInput label="Homepage order" type="number" value={book.homeOrder} onChange={(e) => set({ homeOrder: Number(e.target.value) })} />
        </div>
      </div>

      <div className="adm-card" data-book-tab="content">
        <h2>Description</h2>
        <p className="adm-card-hint">Long-form copy shown on the book's page.</p>
        <TextArea label="Description" rows={5} value={book.description} onChange={(e) => set({ description: e.target.value })} />
        <TextArea label="Description (Urdu)" rows={3} value={book.descriptionUr} onChange={(e) => set({ descriptionUr: e.target.value })} dir="rtl" />
        <TextArea label="Author's note" rows={3} value={book.authorNote} onChange={(e) => set({ authorNote: e.target.value })} />
      </div>

      <div className="adm-card" data-book-tab="content">
        <h2>Tags & lists</h2>
        <p className="adm-card-hint">Genres, "for you if" points and reading tips.</p>
        <div className="adm-grid-2">
          <Field label="Genres / tags">
            <ListEditor items={book.genres} onChange={(genres) => set({ genres })} placeholder="e.g. Literary fiction" />
          </Field>
          <Field label="This is for you if…">
            <ListEditor items={book.forYou} onChange={(forYou) => set({ forYou })} placeholder="e.g. You like slow-burn romance" />
          </Field>
        </div>
        <Field label="Reading tips">
          <PairListEditor
            items={book.readingTips}
            onChange={(readingTips) => set({ readingTips })}
            keyLabel="Label"
            valueLabel="Detail"
            keyPlaceholder="e.g. 22 minutes"
            valuePlaceholder="e.g. Written to be read in one sitting"
          />
        </Field>
      </div>

      <div className="adm-card" data-book-tab="content">
        <h2>Excerpt</h2>
        <p className="adm-card-hint">A short passage or line featured on the book page.</p>
        <TextArea label="Excerpt (Urdu)" rows={3} value={book.excerpt.ur} onChange={(e) => set({ excerpt: { ...book.excerpt, ur: e.target.value } })} dir="rtl" />
        <div className="adm-grid-2">
          <TextInput label="Source label" value={book.excerpt.source} onChange={(e) => set({ excerpt: { ...book.excerpt, source: e.target.value } })} />
          <TextInput label="Episode slug (optional)" value={book.excerpt.episodeSlug} onChange={(e) => set({ excerpt: { ...book.excerpt, episodeSlug: e.target.value } })} />
        </div>
      </div>

      <div className="adm-card" data-book-tab="content">
        <h2>Quote</h2>
        <p className="adm-card-hint">The closing quote shown at the bottom of the book page.</p>
        <TextArea label="Quote (Urdu)" rows={3} value={book.quote.ur} onChange={(e) => set({ quote: { ...book.quote, ur: e.target.value } })} dir="rtl" />
        <TextArea label="Quote (English)" rows={2} value={book.quote.en} onChange={(e) => set({ quote: { ...book.quote, en: e.target.value } })} />
        <TextInput label="Quote source" value={book.quote.source} onChange={(e) => set({ quote: { ...book.quote, source: e.target.value } })} />
      </div>

      <div className="adm-card" data-book-tab="ratings">
        <h2>Rating summary</h2>
        <p className="adm-card-hint">Shown above the reviews on the book page.</p>
        <div className="adm-grid-2">
          <TextInput label="Average rating" type="number" step="0.1" min="0" max="5" value={book.rating.avg} onChange={(e) => set({ rating: { ...book.rating, avg: Number(e.target.value) } })} />
          <TextInput label="Review count" type="number" min="0" value={book.rating.count} onChange={(e) => set({ rating: { ...book.rating, count: Number(e.target.value) } })} />
        </div>
        <Field label="Distribution (5★ to 1★, percentages)">
          <div className="adm-grid-3">
            {book.rating.dist.map((pct, i) => (
              <TextInput
                key={i}
                label={`${5 - i}★`}
                type="number"
                min="0"
                max="100"
                value={pct}
                onChange={(e) => {
                  const dist = [...book.rating.dist];
                  dist[i] = Number(e.target.value);
                  set({ rating: { ...book.rating, dist } });
                }}
              />
            ))}
          </div>
        </Field>
      </div>

      <div className="adm-card" data-book-tab="ratings">
        <div className="adm-row-between">
          <div>
            <h2>Flags</h2>
            <p className="adm-card-hint">Small content states.</p>
          </div>
          <Toggle
            label="Complete novel"
            hint="Shows Complete on the episodic novel card and page."
            checked={!book.moreEpisodesComing}
            onChange={(v) => set({ moreEpisodesComing: !v })}
          />
        </div>
        <div className="adm-grid-2">
          <Toggle label="Placeholder content" hint="Shows the 'final copy pending' banner" checked={book.contentPlaceholder} onChange={(v) => set({ contentPlaceholder: v })} />
          <Toggle label="Placeholder copy tag" hint="Shows the small placeholder flag" checked={book.placeholderCopy} onChange={(v) => set({ placeholderCopy: v })} />
        </div>
        <Toggle
          label="Coming soon"
          hint="Card and page stay visible with a 'Coming Soon' tag, but Read / Download PDF shows a coming-soon message instead of opening the file. For episodic novels this applies to every episode unless overridden per episode below."
          checked={book.comingSoon}
          onChange={(v) => set({ comingSoon: v })}
        />
      </div>

      <div className="adm-card" data-book-tab="episodes">
        <div className="adm-row-between">
          <div>
            <h2>Episodes</h2>
            <p className="adm-card-hint">Only used for episodic novels. Listed in order.</p>
          </div>
          <button
            type="button"
            className="adm-btn adm-btn-outline adm-btn-sm"
            onClick={() => {
              setEpisodes([
                ...episodes,
                { slug: "", title: "", urduTitle: "", teaserUr: "", synopsis: "", closingLineUr: "", pdf: "", readTime: "", published: true, comingSoon: false },
              ]);
              setExpandedEpisode(episodes.length);
            }}
          >
            + Add episode
          </button>
        </div>
        {episodes.length === 0 && <div className="adm-empty">No episodes yet.</div>}
        {episodes.map((ep, i) => (
          <div className={`adm-episode-card${expandedEpisode === i ? " is-open" : ""}`} key={i}>
            <button type="button" className="adm-episode-summary" aria-expanded={expandedEpisode === i} onClick={() => setExpandedEpisode(expandedEpisode === i ? null : i)}>
              <span className="adm-episode-number">{String(i + 1).padStart(2, "0")}</span>
              <span className="adm-episode-heading"><strong>{ep.title || `Episode ${i + 1}`}</strong><small>{ep.urduTitle || ep.slug || "No title yet"}</small></span>
              <span className={`adm-episode-status${ep.published === false ? "" : " is-complete"}`}>{ep.published === false ? "Draft" : "Published"}</span>
              <span className="adm-episode-chevron" aria-hidden="true">⌄</span>
            </button>
            <div className="adm-episode-body">
            <div className="adm-row-between adm-episode-actions">
              <span className="adm-comment-meta">Edit episode details</span>
              <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setEpisodes(episodes.filter((_, idx) => idx !== i))}>
                Remove episode
              </button>
            </div>
            <div className="adm-grid-2">
              <TextInput label="Slug" value={ep.slug} placeholder="episode-01" onChange={(e) => setEpisode(i, { slug: slugify(e.target.value) })} />
              <TextInput label="Title" value={ep.title} onChange={(e) => setEpisode(i, { title: e.target.value })} />
            </div>
            <div className="adm-grid-2">
              <TextInput label="Urdu title" value={ep.urduTitle} onChange={(e) => setEpisode(i, { urduTitle: e.target.value })} dir="rtl" />
              <TextInput label="Read time" value={ep.readTime} onChange={(e) => setEpisode(i, { readTime: e.target.value })} />
            </div>
            <div className="adm-grid-2">
              <Toggle
                label="Published"
                hint="Turn off to keep this episode in draft."
                checked={ep.published !== false}
                onChange={(v) => setEpisode(i, { published: v })}
              />
              <FileField label="PDF" value={ep.pdf} placeholder="Upload episode PDF" onChange={(url) => setEpisode(i, { pdf: url })} />
            </div>
            <Toggle
              label="Coming soon"
              hint="Overrides the book's Coming soon flag for just this episode. Read / Download PDF shows a coming-soon message instead of opening the file."
              checked={!!ep.comingSoon}
              onChange={(v) => setEpisode(i, { comingSoon: v })}
            />
            <TextArea label="Teaser (Urdu)" rows={2} value={ep.teaserUr} onChange={(e) => setEpisode(i, { teaserUr: e.target.value })} dir="rtl" />
            <TextArea label="Synopsis" rows={2} value={ep.synopsis} onChange={(e) => setEpisode(i, { synopsis: e.target.value })} />
            <TextArea label="Closing line (Urdu)" rows={2} value={ep.closingLineUr} onChange={(e) => setEpisode(i, { closingLineUr: e.target.value })} dir="rtl" />
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card" data-book-tab="reviews">
        <h2>Reviews on this book</h2>
        <p className="adm-card-hint">Add, edit, or delete reader comments shown on this book&apos;s page.</p>
        <div className="adm-actions adm-actions-spaced">
          <button className="adm-btn adm-btn-outline adm-btn-sm" type="button" onClick={startAddReview}>
            + Add comment
          </button>
        </div>
        {reviewForm && (
          <div className="adm-kv-editor">
            <div className="adm-grid-2">
              <TextInput
                label="Name"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Field label="Rating">
                <select
                  className="adm-select"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} ★</option>
                  ))}
                </select>
              </Field>
            </div>
            {book.type === "episodic" && (
              <Select
                label="Review location"
                value={reviewForm.episodeSlug || ""}
                onChange={(e) => setReviewForm((f) => ({ ...f, episodeSlug: e.target.value }))}
                options={[
                  { value: "", label: "Whole novel" },
                  ...episodeOptions,
                ]}
              />
            )}
            <TextInput
              label="When (display)"
              value={reviewForm.when}
              onChange={(e) => setReviewForm((f) => ({ ...f, when: e.target.value }))}
            />
            <TextArea
              label="Comment"
              rows={3}
              value={reviewForm.text}
              onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
            />
            <div className="adm-actions">
              <button className="adm-btn adm-btn-primary adm-btn-sm" type="button" disabled={savingReview} onClick={saveReviewForm}>
                {savingReview ? "Saving…" : reviewForm.id ? "Save" : "Add"}
              </button>
              <button className="adm-btn adm-btn-ghost adm-btn-sm" type="button" onClick={() => setReviewForm(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {book.reviews.length === 0 && !reviewForm && <div className="adm-empty">No reviews yet.</div>}
        {book.reviews.map((r) => (
          <div className="adm-comment" key={r.id}>
            <div className="adm-comment-head">
              <strong>{r.name}</strong>
              <span>{"★".repeat(r.rating)}</span>
              {r.episodeSlug && <span className="adm-badge adm-badge-muted">{episodeOptions.find((ep) => ep.value === r.episodeSlug)?.label || r.episodeSlug}</span>}
              <span className="adm-comment-meta">{r.when}</span>
              <span className="adm-actions adm-actions-end">
                <button className="adm-btn adm-btn-outline adm-btn-sm" type="button" onClick={() => startEditReview(r)}>
                  Edit
                </button>
                <button className="adm-btn adm-btn-danger adm-btn-sm" type="button" onClick={() => reviewAction(r)}>
                  Delete
                </button>
              </span>
            </div>
            <p className="adm-comment-text">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="adm-card adm-sticky-card">
        <div className="adm-row-between">
          <div className="adm-comment-meta">
            {isNew ? "Creates the book with the details above." : "Saves all fields and publishes immediately."}
          </div>
          <div className="adm-actions">
            <a className="adm-btn adm-btn-ghost" href="/admin/books">Cancel</a>
            <button className="adm-btn adm-btn-primary" disabled={saving || !book.title} onClick={save}>
              {saving ? "Saving…" : isNew ? "Create book" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
