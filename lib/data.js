// Async data layer for the public site. Reads live data from Supabase when it
// is configured, otherwise falls back to the static seed data in lib/books.js
// and lib/prebooking.js so the site still builds and runs before setup.

import {
  books as seedBooks,
  heroSlides as seedHeroSlides,
  testimonials as seedTestimonials,
  faqs as seedFaqs,
} from "./books";
import { EDITION_DETAILS as seedEditions } from "./prebooking";
import { getDataClient, getAdminClient } from "./supabase-server";
import { rowToBook, rowToTestimonial, rowToPrebooking } from "./serialize";

const augmentSeedBook = (b, i) => ({
  ...b,
  homeVisible: true,
  homeOrder: i,
  published: true,
  episodes: (b.episodes || []).map((ep) => ({ ...ep, published: true })),
});
const SEED_BOOKS = seedBooks.map(augmentSeedBook);
const DEFAULT_HERO_SLUGS = seedHeroSlides.map((b) => b.slug);

// The static seed catalog is always the baseline for the public site. Any row
// the admin writes to Supabase overrides a seed field, but an empty database
// still shows the full site. The seed script (npm run seed) is a shortcut to
// load that baseline into Supabase, not a requirement for the site to render.
//
// Once the books table has any rows, Supabase is the source of truth: books are
// read from the DB so admin edits (and deletions) apply exactly.
function seedEditionFor(slug) {
  const ed = seedEditions[slug];
  return {
    bookSlug: slug,
    price: ed?.price ?? null,
    status: "prebooking",
    note: ed?.note || "",
    pitch: ed?.pitch || "",
    points: ed?.points || [],
    showOnStore: true,
    isComingSoon: ed?.price == null,
  };
}

function seedPrebookingMap() {
  const map = {};
  for (const slug of Object.keys(seedEditions)) map[slug] = seedEditionFor(slug);
  return map;
}

function seedHomeSettings() {
  return {
    hero_slugs: DEFAULT_HERO_SLUGS,
    episodic_slugs: [],
    short_novel_slugs: [],
    afsana_slugs: [],
    hero_autoplay_ms: 6500,
    hero_lede: "",
    reviews_lede: "Sample entries below — swap in real reader reviews and names.",
    quote_text:
      "Their pain matters, their story matters —\nand they are never alone.",
    quote_cite: "— Zoha Asif",
    quotes: [
      {
        ur: "",
        en: "Their pain matters, their story matters —\nand they are never alone.",
        cite: "— Zoha Asif",
        active: true,
      },
    ],
    collection_sliders: {},
    author_intro: {
      portrait: "/images/logo/logo-maroon-bg.png",
      missionUr: "میں وہ جذبات لکھتی ہوں جو زبان تک نہیں پہنچ پاتے۔",
      mission: "“I will name the feelings you were never taught how to say.”",
      poem: "کچھ کہانیاں کتابوں میں نہیں جیتی جاتیں، وہ سینوں میں دفن ہوتی ہیں، وہ آنکھوں میں ٹھہری رہتی ہیں، اور رات کے اندھیرے میں خاموشی سے سانس لیتی ہیں۔ زوہا آصف انہی کہانیوں کو ڈھونڈتی ہیں۔ وہ صرف لکھتی نہیں ہیں بلکہ وہ محسوس کرتی ہیں، گہرائی میں اترتی ہیں اور پھر الفاظ کو اس طرح ترتیب دیتی ہیں کہ پڑھنے والا رک جائے اور سوچے، یہ تو میری ہی بات ہے۔",
      bio: "A pharmacist by education, and a storyteller by the truest calling of her soul, Zoha Asif is an Urdu fiction author based in Lahore, Pakistan. Her writing is not simply fiction — it is emotional archaeology: a careful, tender excavation of the feelings people carry without names, the battles they fight without witnesses, and the healing they reach for without maps. Her work spans Terey Aaney Sey, Tu Sawera Mera, Chupa Humdum, and Unkahe Jazbaat.",
    },
    faqs: seedFaqs,
  };
}

// Admin-panel helpers: the static content, mapped to the shapes the admin API
// responses use. They let the panel show what is actually live on the site even
// before (or without) a seeded database, so nothing is ever a blank editor.
export function getSeedBooksForAdmin() {
  return SEED_BOOKS.map((b) => ({
    slug: b.slug,
    title: b.title,
    titleUrdu: b.titleUrdu || "",
    type: b.type,
    typeLabel: b.typeLabel || "",
    badge: b.badge || "",
    cover: b.cover || "",
    homeVisible: true,
    homeOrder: b.homeOrder ?? 0,
    published: b.published ?? true,
    episodeCount: b.episodes?.length || 0,
    reviewCount: b.reviews?.length || 0,
    inDb: false,
  }));
}

export function getSeedBookForAdmin(slug) {
  const book = SEED_BOOKS.find((b) => b.slug === slug);
  return book ? { ...book, inDb: false } : null;
}

export function getSeedEditionForAdmin(slug) {
  return seedEditionFor(slug);
}

export function getSeedTestimonialsForAdmin() {
  return seedTestimonials.map((t, i) => ({ ...t, id: i, active: true, sortOrder: i }));
}

export function getSeedHomeSettingsForAdmin() {
  const s = seedHomeSettings();
  return {
    heroSlugs: s.hero_slugs,
    episodicSlugs: s.episodic_slugs,
    shortNovelSlugs: s.short_novel_slugs,
    afsanaSlugs: s.afsana_slugs,
    heroAutoplayMs: s.hero_autoplay_ms,
    heroLede: s.hero_lede,
    reviewsLede: s.reviews_lede,
    quoteText: s.quote_text,
    quoteCite: s.quote_cite,
    quotes: normalizeQuotes(s.quotes, s.quote_text, s.quote_cite, s.author_intro),
    collectionSliders: s.collection_sliders || {},
    authorIntro: s.author_intro,
    faqs: s.faqs,
  };
}

function normalizeQuotes(quotes, quoteText, quoteCite, authorIntro) {
  if (Array.isArray(quotes) && quotes.length) {
    return quotes.map((q) => ({
      ur: q.ur || "",
      en: q.en || q.text || "",
      cite: q.cite || "— Zoha Asif",
      active: q.active ?? true,
    }));
  }
  if (Array.isArray(authorIntro?._quotes) && authorIntro._quotes.length) {
    return normalizeQuotes(authorIntro._quotes);
  }
  if (quoteText) {
    return [{ ur: "", en: quoteText, cite: quoteCite || "— Zoha Asif", active: true }];
  }
  return [];
}

async function fetchAll() {
  const db = getDataClient();
  if (!db) {
    return { books: SEED_BOOKS, prebookingMap: seedPrebookingMap() };
  }

  // Reviews are read through the service-role client when available so every
  // reader comment shows (RLS otherwise hides unapproved ones).
  const reviewClient = getAdminClient() || db;

  const [booksRes, epRes, revRes, preRes] = await Promise.all([
    db.from("books").select("*").order("home_order", { ascending: true }),
    db.from("episodes").select("*").order("episode_number", { ascending: true }),
    reviewClient.from("reviews").select("*").order("created_at", { ascending: false }),
    db.from("prebooking").select("*"),
  ]);

  if (booksRes.error) {
    console.error("books fetch failed, using static catalog:", booksRes.error.message);
    return { books: SEED_BOOKS, prebookingMap: seedPrebookingMap() };
  }

  const episodesByBook = {};
  for (const ep of epRes.data || []) {
    (episodesByBook[ep.book_slug] ||= []).push(ep);
  }
  const reviewsByBook = {};
  for (const r of revRes.data || []) {
    (reviewsByBook[r.book_slug] ||= []).push(r);
  }

  const dbBooks = (booksRes.data || []).map((row) =>
    rowToBook(row, episodesByBook[row.slug] || [], reviewsByBook[row.slug] || [])
  );

  const books = dbBooks.length
    ? dbBooks
        .filter((book) => book.published !== false)
        .map((book) => ({
          ...book,
          episodes: (book.episodes || []).filter((episode) => episode.published !== false),
        }))
    : SEED_BOOKS;

  const prebookingMap = seedPrebookingMap();
  for (const p of preRes.data || []) prebookingMap[p.book_slug] = rowToPrebooking(p);

  return { books, prebookingMap };
}

async function getHomeSettings() {
  const db = getDataClient();
  if (!db) return seedHomeSettings();
  try {
    const { data } = await db.from("home_settings").select("*").eq("id", 1).maybeSingle();
    return data || seedHomeSettings();
  } catch (err) {
    console.error("home_settings fetch failed:", err.message);
    return seedHomeSettings();
  }
}

export async function getBooks() {
  const { books } = await fetchAll();
  return books;
}

export async function getCatalogBooks() {
  const books = await getBooks();
  return books.filter((b) => b.published !== false && !b.prebookOnly);
}

export async function getBookBySlug(slug) {
  const seedBook = SEED_BOOKS.find((b) => b.slug === slug) || null;
  const db = getDataClient();
  if (!db) return seedBook;

  const { data: row, error } = await db.from("books").select("*").eq("slug", slug).maybeSingle();
  if (error || !row) {
    if (error) console.error(`books fetch failed for ${slug}:`, error.message);
    return seedBook;
  }
  if (row.published === false) return null;

  const reviewClient = getAdminClient() || db;
  const [epRes, revRes] = await Promise.all([
    db.from("episodes").select("*").eq("book_slug", slug).order("episode_number", { ascending: true }),
    reviewClient.from("reviews").select("*").eq("book_slug", slug).order("created_at", { ascending: false }),
  ]);

  const book = rowToBook(row, epRes.data || [], revRes.data || []);
  return {
    ...book,
    episodes: (book.episodes || []).filter((episode) => episode.published !== false),
  };
}

export async function getHome() {
  const { books } = await fetchAll();
  const settings = await getHomeSettings();

  const heroSlugs = settings.hero_slugs?.length ? settings.hero_slugs : DEFAULT_HERO_SLUGS;
  const heroSlides = heroSlugs
    .map((s) => books.find((b) => b.slug === s))
    .filter(Boolean);

  const visible = books.filter((b) => b.published !== false && b.homeVisible && !b.prebookOnly);
  const byOrder = (a, b) => (a.homeOrder || 0) - (b.homeOrder || 0);

  const bySlugs = (type, slugs) => {
    return slugs?.length
      ? slugs.map((slug) => visible.find((b) => b.slug === slug && b.type === type)).filter(Boolean)
      : visible.filter((b) => b.type === type).sort(byOrder);
  };

  const quotes = normalizeQuotes(
    settings.quotes,
    settings.quote_text,
    settings.quote_cite,
    settings.author_intro
  ).filter((quote) => quote.active !== false);

  const authorIntro = { ...(settings.author_intro || {}) };
  delete authorIntro._quotes;

  return {
    heroSlides,
    heroAutoplayMs: settings.hero_autoplay_ms || 6500,
    heroLede: settings.hero_lede || "",
    reviewsLede: settings.reviews_lede || "",
    quoteText: settings.quote_text || "",
    quoteCite: settings.quote_cite || "",
    quotes,
    collectionSliders: settings.collection_sliders || {},
    authorIntro,
    faqs: settings.faqs?.length ? settings.faqs : seedFaqs,
    episodic: bySlugs("episodic", settings.episodic_slugs),
    shortNovels: bySlugs("short-novel", settings.short_novel_slugs),
    afsanay: bySlugs("afsana", settings.afsana_slugs),
    testimonials: await getTestimonials(),
  };
}

export async function getCollection(type) {
  const books = await getCatalogBooks();
  const items = books.filter((b) => b.type === type);
  const settings = await getHomeSettings();
  const slugs = settings.collection_sliders?.[type] || [];
  const heroSlides = (slugs.length ? slugs : items.map((book) => book.slug))
    .map((slug) => items.find((book) => book.slug === slug))
    .filter(Boolean);

  return { items, heroSlides };
}

export async function getTestimonials() {
  const seed = seedTestimonials.map((t, i) => ({ ...t, id: i, active: true, sortOrder: i }));
  const db = getDataClient();
  if (!db) return seed;

  try {
    const { data } = await db
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const rows = (data || [])
      .map(rowToTestimonial)
      .filter((t) => String(t.quote || "").trim());
    return rows.length ? rows : seed;
  } catch (err) {
    console.error("testimonials fetch failed:", err.message);
    return seed;
  }
}

export async function getPrebooking() {
  const { books, prebookingMap } = await fetchAll();
  return books
    .filter((b) => {
      const ed = prebookingMap[b.slug];
      return ed && ed.showOnStore;
    })
    .map((book) => ({ book, edition: prebookingMap[book.slug] }));
}

export async function getPrebookingFor(slug) {
  const book = await getBookBySlug(slug);
  if (!book) return null;
  let edition = seedEditionFor(slug);

  const db = getDataClient();
  if (db) {
    try {
      const { data } = await db.from("prebooking").select("*").eq("book_slug", slug).maybeSingle();
      if (data) edition = { ...edition, ...rowToPrebooking(data) };
    } catch (err) {
      console.error(`prebooking fetch failed for ${slug}:`, err.message);
    }
  }

  return { book, edition };
}
