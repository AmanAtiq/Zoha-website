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
  { id: "pageSliders", label: "Page sliders" },
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
  const collectionSliders = settings?.collectionSliders || {};
  const sortedHero = books
    .filter((b) => heroSlugs.includes(b.slug))
    .sort((a, b) => heroSlugs.indexOf(a.slug) - heroSlugs.indexOf(b.slug));
  const libraryBooks = books.filter((b) => !heroSlugs.includes(b.slug) && !b.prebookOnly && !b.prebook_only);
  const selectedBySection = (slugs, type) =>
    books.filter((b) => slugs.includes(b.slug) && b.type === type && !b.prebookOnly && !b.prebook_only)
      .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  const visibleByType = (type) => books
    .filter((b) => b.type === type && b.homeVisible && !b.prebookOnly && !b.prebook_only)
    .sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0));
  const selectedEpisodic = settings && Object.prototype.hasOwnProperty.call(settings, "episodicSlugs")
    ? selectedBySection(episodicSlugs, "episodic") : homeSections.episodic;
  const selectedShortNovels = settings && Object.prototype.hasOwnProperty.call(settings, "shortNovelSlugs")
    ? selectedBySection(shortNovelSlugs, "short-novel") : homeSections.shortNovels;
  const selectedAfsanay = settings && Object.prototype.hasOwnProperty.call(settings, "afsanaSlugs")
    ? selectedBySection(afsanaSlugs, "afsana") : homeSections.afsanay;
  const libraryBySection = (selectedSlugs, type) => books.filter((b) => b.type === type && !selectedSlugs.includes(b.slug) && !b.prebookOnly && !b.prebook_only);
  const libraryEpisodic = libraryBySection(selectedEpisodic.map((b) => b.slug), "episodic");
  const libraryShortNovels = libraryBySection(selectedShortNovels.map((b) => b.slug), "short-novel");
  const libraryAfsanay = libraryBySection(selectedAfsanay.map((b) => b.slug), "afsana");

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
    return { ...prev, [key]: [...current, slug] };
  });
  const removeFromSection = (key, slug) => setSettings((prev) => ({ ...prev, [key]: (prev?.[key] || []).filter((s) => s !== slug) }));
  const moveSection = (key, index, dir) => {
    const next = [...(settings[key] || [])]; const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]]; set({ [key]: next });
  };
  const sliderSlugsFor = (type) => collectionSliders[type] || [];
  const sliderSelected = (type) => selectedBySection(sliderSlugsFor(type), type);
  const sliderLibrary = (type) => libraryBySection(sliderSelected(type).map((b) => b.slug), type);
  const setSliderSlugs = (type, slugs) => set({
    collectionSliders: {
      ...collectionSliders,
      [type]: slugs,
    },
  });
  const addToSlider = (type, slug) => {
    const current = sliderSlugsFor(type);
    if (current.includes(slug)) return;
    setSliderSlugs(type, [...current, slug]);
  };
  const removeFromSlider = (type, slug) => setSliderSlugs(type, sliderSlugsFor(type).filter((s) => s !== slug));
  const moveSlider = (type, index, dir) => {
    const next = [...sliderSlugsFor(type)]; const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setSliderSlugs(type, next);
  };
  const saveTestimonial = async (t) => {
    setSavingTestimonial(t.id);
    setError("");
    setNotice("");
    try {
      const quote = String(t.quote || "").trim();
      if (t.active && !quote) {
        throw new Error("Add review text before making it visible on the homepage.");
      }
      const order = Number(t.sortOrder);
      if (!Number.isFinite(order)) {
        throw new Error("Order must be a number.");
      }
      const clash = testimonials.find(
        (other) => other.id !== t.id && Number(other.sortOrder) === order
      );
      if (clash) {
        throw new Error(`Order ${order} is already used by another review. Pick a unique order.`);
      }
      const { testimonial } = await api(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        body: JSON.stringify({
          quote: t.quote,
          source: t.source,
          active: t.active,
          sortOrder: order,
        }),
      });
      if (testimonial) {
        setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...testimonial } : x)));
      }
      setNotice("Review updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTestimonial(null);
    }
  };
  const addTestimonial = async () => {
    setError("");
    try {
      const used = new Set(testimonials.map((t) => Number(t.sortOrder)));
      let nextOrder = testimonials.length;
      while (used.has(nextOrder)) nextOrder += 1;
      const { testimonial } = await api("/api/admin/testimonials", {
        method: "POST",
        body: JSON.stringify({ quote: "", source: "", active: false, sortOrder: nextOrder }),
      });
      setTestimonials((prev) => [
        ...prev,
        {
          id: testimonial.id,
          quote: testimonial.quote || "",
          source: testimonial.source || "",
          active: false,
          sortOrder: testimonial.sortOrder ?? nextOrder,
        },
      ]);
      setNotice("Review slot added — fill it in, then turn on “Visible on homepage” and Save.");
    } catch (err) {
      setError(err.message);
    }
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
  const renderSection = (key, title, description, selected, library) => (
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
          <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => addToSection(key, book.slug)}>Add</button>
        </div>
      ))}
    </section>
  );
  const renderSliderSection = (type, title, description) => {
    const selected = sliderSelected(type);
    const library = sliderLibrary(type);
    return (
      <section className="adm-home-section" key={type}>
        <div className="adm-section-title">{title}</div>
        <p className="adm-card-hint">{description}</p>
        {selected.length === 0 && <div className="adm-empty adm-section-empty">No slides selected. The public page will use its collection order.</div>}
        {selected.map((book, i) => (
          <div className="adm-comment adm-selection-row" key={book.slug}>
            <div className="adm-row-between">
              <div className="adm-media-row">
                {book.cover && <img className="adm-thumb" src={book.cover} alt="" />}
                <div><strong>{book.title}</strong><div className="adm-comment-meta">{book.type_label} · slide {i + 1}</div></div>
              </div>
              <div className="adm-actions">
                <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === 0} onClick={() => moveSlider(type, i, -1)}>↑</button>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === selected.length - 1} onClick={() => moveSlider(type, i, 1)}>↓</button>
                <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => removeFromSlider(type, book.slug)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        {library.length > 0 && <div className="adm-library-label">Available to add</div>}
        {library.map((book) => (
          <div className="adm-row-between adm-library-row" key={book.slug}>
            <span>{book.title} <span className="adm-comment-meta">· {book.type_label}</span></span>
            <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => addToSlider(type, book.slug)}>Add slide</button>
          </div>
        ))}
      </section>
    );
  };

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

        {activeTab === "pageSliders" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Collection page sliders</h2><p>Choose and order the hero slides for each reading collection page.</p></div><div className="adm-card-body">{renderSliderSection("episodic", "Episodic novels page", "Slides on /episodic-novels.")}{renderSliderSection("short-novel", "Short novels page", "Slides on /short-novels.")}{renderSliderSection("afsana", "Afsanay page", "Slides on /afsanay.")}</div></div></div>}

        {activeTab === "featured" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Featured on the homepage</h2><p>Choose the books shown in each dedicated shelf further down the page. Add as many as you need.</p></div><div className="adm-card-body">{renderSection("episodicSlugs", "Featured episodic novels", "All selected episodic novels appear in this order.", selectedEpisodic, libraryEpisodic)}{renderSection("shortNovelSlugs", "Featured short novels", "All selected short novels appear in this order.", selectedShortNovels, libraryShortNovels)}{renderSection("afsanaSlugs", "Featured afsanay", "All selected afsanay appear in this order.", selectedAfsanay, libraryAfsanay)}</div></div></div>}

        {activeTab === "reviews" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Reviews shown</h2><p>These are the quote-slider entries on the homepage.</p></div><div className="adm-card-body">{testimonials.map((t) => <div className="adm-kv-editor" key={t.id}><div className="adm-row-between adm-testimonial-header"><Toggle label="Visible on homepage" checked={t.active} onChange={(v) => updateTestimonial(t.id, { active: v })} /><div className="adm-actions"><button className="adm-btn adm-btn-primary adm-btn-sm" disabled={savingTestimonial === t.id} onClick={() => saveTestimonial(t)}>Save</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => deleteTestimonial(t.id)}>Delete</button></div></div><TextArea label="Quote" rows={3} value={t.quote} onChange={(e) => updateTestimonial(t.id, { quote: e.target.value })} /><div className="adm-grid-2"><TextInput label="Source" value={t.source} placeholder="e.g. Reader, Instagram" onChange={(e) => updateTestimonial(t.id, { source: e.target.value })} /><TextInput label="Order" type="number" value={t.sortOrder} onChange={(e) => updateTestimonial(t.id, { sortOrder: Number(e.target.value) })} /></div></div>)}<button className="adm-btn adm-btn-outline adm-btn-sm" onClick={addTestimonial}>+ Add review</button></div></div></div>}

        {activeTab === "quote" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Quote band</h2><p>Slidable quotes between homepage sections. Each slide supports Urdu and English — same fonts as the novel detail quote.</p></div><div className="adm-card-body">{(settings.quotes || []).map((q, i) => <div className="adm-kv-editor" key={i}><div className="adm-row-between adm-testimonial-header"><Toggle label="Visible on homepage" checked={q.active !== false} onChange={(v) => { const next = settings.quotes.map((item, idx) => idx === i ? { ...item, active: v } : item); set({ quotes: next }); }} /><div className="adm-actions"><button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === 0} onClick={() => { const next = [...settings.quotes]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; set({ quotes: next }); }}>↑</button><button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={i === settings.quotes.length - 1} onClick={() => { const next = [...settings.quotes]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; set({ quotes: next }); }}>↓</button><button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => set({ quotes: settings.quotes.filter((_, idx) => idx !== i) })}>Remove</button></div></div><TextArea label="Quote (Urdu)" rows={3} value={q.ur || ""} onChange={(e) => { const next = settings.quotes.map((item, idx) => idx === i ? { ...item, ur: e.target.value } : item); set({ quotes: next }); }} dir="rtl" /><TextArea label="Quote (English)" rows={2} value={q.en || ""} onChange={(e) => { const next = settings.quotes.map((item, idx) => idx === i ? { ...item, en: e.target.value } : item); set({ quotes: next }); }} /><TextInput label="Attribution" value={q.cite || ""} onChange={(e) => { const next = settings.quotes.map((item, idx) => idx === i ? { ...item, cite: e.target.value } : item); set({ quotes: next }); }} /><div className="adm-quote-preview">{q.ur && <p className="adm-quote-preview-ur" lang="ur" dir="rtl">{q.ur}</p>}{q.en && <p>{q.en}</p>}<span>{q.cite || "— Zoha Asif"}</span></div></div>)}<button type="button" className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => set({ quotes: [...(settings.quotes || []), { ur: "", en: "", cite: "— Zoha Asif", active: true }] })}>+ Add quote</button></div></div></div>}

        {activeTab === "about" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>About the author</h2><p>The text and portrait shown in the homepage author section.</p></div><div className="adm-card-body"><ImageField label="Portrait" value={authorIntro.portrait} onChange={(url) => set({ authorIntro: { ...authorIntro, portrait: url } })} wide /><TextArea label="Mission (Urdu)" rows={2} value={authorIntro.missionUr} onChange={(e) => set({ authorIntro: { ...authorIntro, missionUr: e.target.value } })} dir="rtl" /><TextArea label="Mission (English)" rows={2} value={authorIntro.mission} onChange={(e) => set({ authorIntro: { ...authorIntro, mission: e.target.value } })} /><TextArea label="Poem (Urdu)" rows={5} value={authorIntro.poem} onChange={(e) => set({ authorIntro: { ...authorIntro, poem: e.target.value } })} dir="rtl" /><TextArea label="Biography" rows={6} value={authorIntro.bio} onChange={(e) => set({ authorIntro: { ...authorIntro, bio: e.target.value } })} /></div></div></div>}

        {activeTab === "faqs" && <div className="adm-home-panel"><div className="adm-card"><div className="adm-card-head"><h2>Frequently asked questions</h2><p>Shown at the bottom of the homepage, in this order.</p></div><div className="adm-card-body"><PairListEditor items={settings.faqs || []} onChange={(faqs) => set({ faqs })} keyLabel="Q" valueLabel="A" keyPlaceholder="Question" valuePlaceholder="Answer" addLabel="Add FAQ" /></div></div></div>}
      </div>

      <div className="adm-home-savebar"><span><i /> Changes publish immediately to the live site.</span><button className="adm-btn adm-btn-primary" disabled={saving} onClick={saveAll}>{saving ? "Saving…" : "Save homepage"}</button></div>
    </div>
  );
}
