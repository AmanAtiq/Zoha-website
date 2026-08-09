"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/admin-client";
import {
  Alert,
  TextInput,
  TextArea,
  Toggle,
  PairListEditor,
  ImageField,
  Pending,
} from "../../../components/admin/fields";

const TABS = [
  { id: "hero", label: "Hero slider" },
  { id: "featured", label: "Featured selections" },
  { id: "reviews", label: "Reviews" },
  { id: "quote", label: "Quote band" },
  { id: "about", label: "About the author" },
  { id: "faqs", label: "FAQs" },
];

export default function AdminHomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [books, setBooks] = useState([]);
  const [homeSections, setHomeSections] = useState({ episodic: [], shortNovels: [], afsanay: [] });
  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState("hero");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingTestimonial, setSavingTestimonial] = useState(null);

  const load = async () => {
    try {
      const data = await api("/api/admin/home");
      const effectiveSettings = { ...data.settings };
      if (!effectiveSettings.episodicSlugs?.length && data.homeSections?.episodic?.length) {
        effectiveSettings.episodicSlugs = data.homeSections.episodic.map((b) => b.slug);
      }
      if (!effectiveSettings.shortNovelSlugs?.length && data.homeSections?.shortNovels?.length) {
        effectiveSettings.shortNovelSlugs = data.homeSections.shortNovels.map((b) => b.slug);
      }
      if (!effectiveSettings.afsanaSlugs?.length && data.homeSections?.afsanay?.length) {
        effectiveSettings.afsanaSlugs = data.homeSections.afsanay.map((b) => b.slug);
      }
      setSettings(effectiveSettings);
      setBooks(data.books);
      setHomeSections(data.homeSections || { episodic: [], shortNovels: [], afsanay: [] });
      setTestimonials(data.testimonials);
    } catch (err) {
      if (err.name === "AuthError") return router.replace("/admin");
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const heroSlugs = settings?.heroSlugs || [];
  const episodicSlugs = settings?.episodicSlugs || [];
  const shortNovelSlugs = settings?.shortNovelSlugs || [];
  const afsanaSlugs = settings?.afsanaSlugs || [];
  const sortedHero = books
    .filter((b) => heroSlugs.includes(b.slug))
    .sort((a, b) => heroSlugs.indexOf(a.slug) - heroSlugs.indexOf(b.slug));
  const libraryBooks = books.filter((b) => !heroSlugs.includes(b.slug));
  const selectedBySection = (slugs, type) =>
    books.filter((b) => slugs.includes(b.slug) && b.type === type)
      .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  const visibleByType = (type) => books
    .filter((b) => b.type === type && b.homeVisible)
    .sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0));
  const sectionLimit = { episodic: 1, "short-novel": 2, afsana: 3 };
  const visibleTopByType = (type) => visibleByType(type).slice(0, sectionLimit[type]);
  const selectedEpisodic = settings && Object.prototype.hasOwnProperty.call(settings, "episodicSlugs")
    ? selectedBySection(episodicSlugs, "episodic").slice(0, sectionLimit.episodic) : homeSections.episodic;
  const selectedShortNovels = settings && Object.prototype.hasOwnProperty.call(settings, "shortNovelSlugs")
    ? selectedBySection(shortNovelSlugs, "short-novel").slice(0, sectionLimit["short-novel"]) : homeSections.shortNovels;
  const selectedAfsanay = settings && Object.prototype.hasOwnProperty.call(settings, "afsanaSlugs")
    ? selectedBySection(afsanaSlugs, "afsana").slice(0, sectionLimit.afsana) : homeSections.afsanay;
  const libraryBySection = (selectedSlugs, type) => books.filter((b) => b.type === type && !selectedSlugs.includes(b.slug));
  const libraryEpisodic = libraryBySection(selectedEpisodic.map((b) => b.slug), "episodic");
  const libraryShortNovels = libraryBySection(selectedShortNovels.map((b) => b.slug), "short-novel");
  const libraryAfsanay = libraryBySection(selectedAfsanay.map((b) => b.slug), "afsana");
  const sectionFull = {
    episodicSlugs: selectedEpisodic.length >= sectionLimit.episodic,
    shortNovelSlugs: selectedShortNovels.length >= sectionLimit["short-novel"],
    afsanaSlugs: selectedAfsanay.length >= sectionLimit.afsana,
  };

  const saveAll = async () => {
    setSaving(true); setError(""); setNotice("");
    try {
      await api("/api/admin/home", { method: "PUT", body: JSON.stringify({ settings }) });
      setNotice("Homepage settings saved.");
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const addToHero = (slug) => set({ heroSlugs: [...heroSlugs, slug] });
  const removeFromHero = (slug) => set({ heroSlugs: heroSlugs.filter((s) => s !== slug) });
  const moveHero = (index, dir) => {
    const next = [...heroSlugs]; const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]]; set({ heroSlugs: next });
  };
  const updateTestimonial = (id, patch) => setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const sectionKeyToType = { episodicSlugs: "episodic", shortNovelSlugs: "short-novel", afsanaSlugs: "afsana" };
  const addToSection = (key, slug) => setSettings((prev) => {
    const current = prev?.[key] || []; const type = sectionKeyToType[key];
    if (current.includes(slug)) return prev;
    const validSelected = books.filter((b) => current.includes(b.slug) && b.type === type);
    if (validSelected.length >= sectionLimit[type]) return prev;
    return { ...prev, [key]: [...current, slug] };
  });
  const removeFromSection = (key, slug) => setSettings((prev) => ({ ...prev, [key]: (prev?.[key] || []).filter((s) => s !== slug) }));
  const moveSection = (key, index, dir) => {
    const next = [...(settings[key] || [])]; const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]]; set({ [key]: next });
  };
  const saveTestimonial = async (t) => {
    setSavingTestimonial(t.id);
    try {
      await api(`/api/admin/testimonials/${t.id}`, { method: "PUT", body: JSON.stringify({ quote: t.quote, source: t.source, active: t.active, sortOrder: t.sortOrder }) });
      setNotice("Review updated.");
    } catch (err) { setError(err.message); } finally { setSavingTestimonial(null); }
  };
  const addTestimonial = async () => {
    try {
      const { testimonial } = await api("/api/admin/testimonials", { method: "POST", body: JSON.stringify({ quote: "", source: "", active: true, sortOrder: testimonials.length }) });
      setTestimonials((prev) => [...prev, { ...testimonial, quote: "", source: "" }]);
    } catch (err) { setError(err.message); }
  };
  const deleteTestimonial = async (id) => {
    if (!window.confirm("Delete this homepage review?")) return;
    try {
      await api(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) { setError(err.message); }
  };

  if (!settings) {
    return <><div className="adm-topbar"><h1>Homepage</h1></div>{error && <Alert>{error}</Alert>}<div className="adm-empty">Loading…</div></>;
  }

  const authorIntro = settings.authorIntro || {};
  const renderSection = (key, title, description, selected, library, type) => (
    <section className="adm-home-section" key={key}>
      <div className="adm-section-title">{title}</div>
      <p className="adm-card-hint">{description}</p>
      {selected.length === 0 && <div className="adm-empty adm-section-empty">Nothing selected yet.</div>}
      {selected.map((book, i) => (
        <div className="adm-comment adm-selection-row" key={book.slug}>
          <div className="adm-row-between">
            <div className="adm-media-row">
              {book.cover && <img className="adm-thumb" src={book.cover} alt="" />}
              <div><strong>{book.title}</strong><div className="adm-comment-meta">{book.type_label} · {i + 1}</div></div>
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === 0} onClick={() => moveSection(key, i, -1)}>↑</button>
              <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === selected.length - 1} onClick={() => moveSection(key, i, 1)}>↓</button>
              <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => removeFromSection(key, book.slug)}>Remove</button>
            </div>
          </div>
        </div>
      ))}
      {library.length > 0 && <div className="adm-library-label">Available to add</div>}
      {library.map((book) => (
        <div className="adm-row-between adm-library-row" key={book.slug}>
          <span>{book.title} <span className="adm-comment-meta">· {book.type_label}</span></span>
          <button className="adm-btn adm-btn-outline adm-btn-sm" disabled={sectionFull[key]} onClick={() => addToSection(key, book.slug)}>Add</button>
        </div>
      ))}
      {sectionFull[key] && <div className="adm-field-hint adm-limit-note">Maximum {sectionLimit[type]} selected.</div>}
    </section>
  );

  return (
    <div className="adm-home-editor">
      <div className="adm-topbar adm-home-topbar">
        <div><div className="adm-crumbs">Content studio / Homepage</div><h1>Homepage editor</h1></div>
        <div className="adm-topbar-actions"><a className="adm-btn adm-btn-ghost" href="/" target="_blank" rel="noreferrer">View live site ↗</a><button className="adm-btn adm-btn-primary" disabled={saving} onClick={saveAll}>{saving ? "Saving…" : "Save homepage"}</button></div>
      </div>
      <Pending busy={saving} />
      {error && <Alert>{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      <div className="adm-home-tabs" role="tablist" aria-label="Homepage sections">
        {TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={`adm-home-tab${activeTab === tab.id ? " is-active" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </div>

      <div className="adm-home-panels">
        {activeTab === "hero" && <div className="adm-home-panel">
          <div className="adm-card"><div className="adm-card-head"><h2>Slides in the hero</h2><p>Pick which books appear on the home hero and in what order.</p></div><div className="adm-card-body">
            {sortedHero.length === 0 && <div className="adm-empty">No slides yet — add books from the library below.</div>}
            {sortedHero.map((book, i) => <div className="adm-comment adm-selection-row" key={book.slug}><div className="adm-row-between"><div className="adm-media-row">{book.cover && <img className="adm-thumb" src={book.cover} alt="" />}<div><strong>{book.title}</strong><div className="adm-comment-meta">{book.type_label} · {i + 1}</div></div></div><div className="adm-actions"><button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === 0} onClick={() => moveHero(i, -1)}>↑</button><button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === sortedHero.length - 1} onClick={() => moveHero(i, 1)}>↓</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => removeFromHero(book.slug)}>Remove</button></div></div></div>)}
            <div className="adm-library-label">Available to add</div>
            {libraryBooks.length === 0 && <div className="adm-empty">Every book is already in the hero.</div>}
            {libraryBooks.map((book) => <div className="adm-row-between adm-library-row" key={book.slug}><span>{book.title} <span className="adm-comment-meta">· {book.type_label}</span></span><button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => addToHero(book.slug)}>Add to hero</button></div>)}
          </div></div>
          <div className="adm-card"><div className="adm-card-head"><h2>Slide settings</h2><p>Applies to the hero as a whole, not to individual slides.</p></div><div className="adm-card-body adm-grid-2"><TextInput label="Hero lede (optional subtitle)" value={settings.heroLede} onChange={(e) => set({ heroLede: e.target.value })} /><TextInput label="Slide duration (ms)" type="number" value={settings.heroAutoplayMs} onChange={(e) => set({ heroAutoplayMs: Number(e.target.value) })} hint="Time each slide stays on screen before advancing." /></div></div>
        </div>}

        {activeTab === "featured" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Featured on the homepage</h2><p>Choose the books shown in each dedicated shelf further down the page.</p></div><div className="adm-card-body">{renderSection("episodicSlugs", "Featured episodic novel", "Only one episodic novel appears at a time.", selectedEpisodic, libraryEpisodic, "episodic")}{renderSection("shortNovelSlugs", "Featured short novels", "Only two short novels appear on the homepage.", selectedShortNovels, libraryShortNovels, "short-novel")}{renderSection("afsanaSlugs", "Featured afsanay", "Only three afsanay appear on the homepage.", selectedAfsanay, libraryAfsanay, "afsana")}</div></div></div>}

        {activeTab === "reviews" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Section text</h2><p>Introductory copy shown above the homepage reviews.</p></div><div className="adm-card-body"><TextArea label="Reviews lede" rows={2} value={settings.reviewsLede} onChange={(e) => set({ reviewsLede: e.target.value })} /></div></div><div className="adm-card"><div className="adm-card-head"><h2>Reviews shown</h2><p>These are the quote-slider entries on the homepage.</p></div><div className="adm-card-body">{testimonials.map((t) => <div className="adm-kv-editor" key={t.id}><div className="adm-row-between adm-testimonial-header"><Toggle label="Visible on homepage" checked={t.active} onChange={(v) => updateTestimonial(t.id, { active: v })} /><div className="adm-actions"><button className="adm-btn adm-btn-primary adm-btn-sm" disabled={savingTestimonial === t.id} onClick={() => saveTestimonial(t)}>Save</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => deleteTestimonial(t.id)}>Delete</button></div></div><TextArea label="Quote" rows={3} value={t.quote} onChange={(e) => updateTestimonial(t.id, { quote: e.target.value })} /><div className="adm-grid-2"><TextInput label="Source" value={t.source} placeholder="e.g. Reader, Instagram" onChange={(e) => updateTestimonial(t.id, { source: e.target.value })} /><TextInput label="Order" type="number" value={t.sortOrder} onChange={(e) => updateTestimonial(t.id, { sortOrder: Number(e.target.value) })} /></div></div>)}<button className="adm-btn adm-btn-outline adm-btn-sm" onClick={addTestimonial}>+ Add review</button></div></div></div>}

        {activeTab === "quote" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Quote band</h2><p>The centered quote between the homepage sections.</p></div><div className="adm-card-body adm-grid-2"><div><TextArea label="Quote text" rows={3} value={settings.quoteText} onChange={(e) => set({ quoteText: e.target.value })} /><TextInput label="Quote attribution" value={settings.quoteCite} onChange={(e) => set({ quoteCite: e.target.value })} /></div><div className="adm-quote-preview"><p>{settings.quoteText}</p><span>{settings.quoteCite}</span></div></div></div></div>}

        {activeTab === "about" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>About the author</h2><p>The text and portrait shown in the homepage author section.</p></div><div className="adm-card-body"><ImageField label="Portrait" value={authorIntro.portrait} onChange={(url) => set({ authorIntro: { ...authorIntro, portrait: url } })} wide /><TextArea label="Mission (Urdu)" rows={2} value={authorIntro.missionUr} onChange={(e) => set({ authorIntro: { ...authorIntro, missionUr: e.target.value } })} dir="rtl" /><TextArea label="Mission (English)" rows={2} value={authorIntro.mission} onChange={(e) => set({ authorIntro: { ...authorIntro, mission: e.target.value } })} /><TextArea label="Poem (Urdu)" rows={5} value={authorIntro.poem} onChange={(e) => set({ authorIntro: { ...authorIntro, poem: e.target.value } })} dir="rtl" /><TextArea label="Biography" rows={6} value={authorIntro.bio} onChange={(e) => set({ authorIntro: { ...authorIntro, bio: e.target.value } })} /></div></div></div>}

        {activeTab === "faqs" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Frequently asked questions</h2><p>Shown at the bottom of the homepage, in this order.</p></div><div className="adm-card-body"><PairListEditor items={settings.faqs || []} onChange={(faqs) => set({ faqs })} keyLabel="Q" valueLabel="A" keyPlaceholder="Question" valuePlaceholder="Answer" addLabel="Add FAQ" /></div></div></div>}
      </div>

      <div className="adm-home-savebar"><span><i /> Changes publish immediately to the live site.</span><button className="adm-btn adm-btn-primary" disabled={saving} onClick={saveAll}>{saving ? "Saving…" : "Save homepage"}</button></div>
    </div>
  );
}
