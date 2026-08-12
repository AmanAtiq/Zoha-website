import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";
import { rowToTestimonial } from "../../../../lib/serialize";
import {
  getHome,
  getSeedBooksForAdmin,
  getSeedTestimonialsForAdmin,
  getSeedHomeSettingsForAdmin,
} from "../../../../lib/data";

const DEFAULT_AUTHOR_INTRO = {
  portrait: "/images/logo/logo-maroon-bg.png",
  missionUr: "میں وہ جذبات لکھتی ہوں جو زبان تک نہیں پہنچ پاتے۔",
  mission: "“I will name the feelings you were never taught how to say.”",
  poem: "کچھ کہانیاں کتابوں میں نہیں جیتی جاتیں، وہ سینوں میں دفن ہوتی ہیں، وہ آنکھوں میں ٹھہری رہتی ہیں، اور رات کے اندھیرے میں خاموشی سے سانس لیتی ہیں۔ زوہا آصف انہی کہانیوں کو ڈھونڈتی ہیں۔ وہ صرف لکھتی نہیں ہیں بلکہ وہ محسوس کرتی ہیں، گہرائی میں اترتی ہیں اور پھر الفاظ کو اس طرح ترتیب دیتی ہیں کہ پڑھنے والا رک جائے اور سوچے، یہ تو میری ہی بات ہے۔",
  bio: "A pharmacist by education, and a storyteller by the truest calling of her soul, Zoha Asif is an Urdu fiction author based in Lahore, Pakistan. Her writing is not simply fiction — it is emotional archaeology: a careful, tender excavation of the feelings people carry without names, the battles they fight without witnesses, and the healing they reach for without maps. Her work spans Terey Aaney Sey, Tu Sawera Mera, Chupa Humdum, and Unkahe Jazbaat.",
};

export const dynamic = "force-dynamic";

function normalizeAdminQuotes(quotes, quoteText, quoteCite, authorIntro) {
  if (Array.isArray(quotes) && quotes.length) {
    return quotes.map((q) => ({
      ur: q.ur || "",
      en: q.en || q.text || "",
      cite: q.cite || "— Zoha Asif",
      active: q.active ?? true,
    }));
  }
  if (Array.isArray(authorIntro?._quotes) && authorIntro._quotes.length) {
    return normalizeAdminQuotes(authorIntro._quotes);
  }
  if (quoteText) {
    return [{ ur: "", en: quoteText, cite: quoteCite || "— Zoha Asif", active: true }];
  }
  return [{ ur: "", en: "", cite: "— Zoha Asif", active: true }];
}

export async function GET() {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const [settingsRes, testRes, booksRes] = await Promise.all([
    admin.from("home_settings").select("*").eq("id", 1).maybeSingle(),
    admin.from("testimonials").select("*").order("sort_order", { ascending: true }),
    admin.from("books").select("slug, title, type, type_label, cover, home_visible, home_order, prebook_only, published").order("home_order", { ascending: true }),
  ]);

  // Show what's actually live on the site even before the DB is seeded: the
  // panel is never blank. DB rows take precedence once they exist.
  const settings = settingsRes.data
    ? (() => {
        const authorIntro = {
          ...DEFAULT_AUTHOR_INTRO,
          ...(settingsRes.data.author_intro || {}),
        };
        delete authorIntro._quotes;
        return {
          heroSlugs: settingsRes.data.hero_slugs || [],
          episodicSlugs: settingsRes.data.episodic_slugs || [],
          shortNovelSlugs: settingsRes.data.short_novel_slugs || [],
          afsanaSlugs: settingsRes.data.afsana_slugs || [],
          heroAutoplayMs: settingsRes.data.hero_autoplay_ms ?? 6500,
          heroLede: settingsRes.data.hero_lede || "",
          reviewsLede: settingsRes.data.reviews_lede || "",
          quoteText: settingsRes.data.quote_text || "",
          quoteCite: settingsRes.data.quote_cite || "",
          quotes: normalizeAdminQuotes(
            settingsRes.data.quotes,
            settingsRes.data.quote_text,
            settingsRes.data.quote_cite,
            settingsRes.data.author_intro
          ),
          collectionSliders: settingsRes.data.collection_sliders || {},
          authorIntro,
          faqs: settingsRes.data.faqs || [],
        };
      })()
    : getSeedHomeSettingsForAdmin();

  const dbTestimonials = (testRes.data || []).map(rowToTestimonial);
  const testimonials = dbTestimonials.length ? dbTestimonials : getSeedTestimonialsForAdmin();

  const dbBooks = (booksRes.data || []).map((b) => ({
    slug: b.slug,
    title: b.title,
    type: b.type,
    type_label: b.type_label || "",
    cover: b.cover || "",
    home_visible: b.home_visible,
    home_order: b.home_order,
    prebookOnly: !!b.prebook_only,
    published: b.published ?? true,
  }));
  const books = dbBooks.length ? dbBooks : getSeedBooksForAdmin().map((b) => ({
    slug: b.slug,
    title: b.title,
    type: b.type,
    type_label: b.typeLabel || "",
    cover: b.cover || "",
    home_visible: b.homeVisible,
    home_order: b.homeOrder,
    prebookOnly: !!b.prebookOnly,
    published: b.published ?? true,
  }));

  const home = await getHome();

  return NextResponse.json({ settings, testimonials, books, homeSections: {
    episodic: home.episodic,
    shortNovels: home.shortNovels,
    afsanay: home.afsanay,
  } });
}

export async function PUT(request) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const s = body.settings || {};
  const quotes = Array.isArray(s.quotes)
    ? s.quotes.map((q) => ({
        ur: String(q.ur || "").trim(),
        en: String(q.en || "").trim(),
        cite: String(q.cite || "").trim() || "— Zoha Asif",
        active: q.active ?? true,
      }))
    : [];
  const first = quotes[0] || {};
  const authorIntro = { ...(s.authorIntro || {}) };
  delete authorIntro._quotes;

  const makeRow = (includeQuotes = true, includeCollectionSliders = true) => {
    const row = {
      id: 1,
      hero_slugs: s.heroSlugs ?? [],
      episodic_slugs: s.episodicSlugs ?? [],
      short_novel_slugs: s.shortNovelSlugs ?? [],
      afsana_slugs: s.afsanaSlugs ?? [],
      hero_autoplay_ms: Number(s.heroAutoplayMs) || 6500,
      hero_lede: s.heroLede || "",
      reviews_lede: s.reviewsLede || "",
      quote_text: first.en || first.ur || s.quoteText || "",
      quote_cite: first.cite || s.quoteCite || "",
      author_intro: authorIntro,
      faqs: s.faqs || [],
    };
    if (includeQuotes) row.quotes = quotes;
    if (includeCollectionSliders) row.collection_sliders = s.collectionSliders || {};
    return row;
  };

  const saveRow = (row) => admin.from("home_settings").upsert(row, { onConflict: "id" });
  const { error } = await saveRow(makeRow(true, true));

  if (error) {
    // Older DBs may not have the `quotes` column yet — save the first quote
    // into legacy fields and stash the full list on author_intro until migrated.
    if (/quotes/i.test(error.message)) {
      const fallbackRow = makeRow(false, !/collection_sliders/i.test(error.message));
      fallbackRow.author_intro = { ...authorIntro, _quotes: quotes };
      const fallback = await saveRow(fallbackRow);
      if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      return NextResponse.json({
        ok: true,
        warning: "Run: alter table public.home_settings add column if not exists quotes jsonb default '[]';",
      });
    }
    if (/collection_sliders/i.test(error.message)) {
      const fallback = await saveRow(makeRow(true, false));
      if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      return NextResponse.json({
        ok: true,
        warning: "Run: alter table public.home_settings add column if not exists collection_sliders jsonb default '{}';",
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
