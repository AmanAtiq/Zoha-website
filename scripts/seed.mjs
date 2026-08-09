// Seed the Supabase database from the static seed data in lib/books.js
// and lib/prebooking.js. Run:  npm run seed
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from "@supabase/supabase-js";
import { books, heroSlides, testimonials, faqs } from "../lib/books.js";
import { EDITION_DETAILS } from "../lib/prebooking.js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local first."
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: {
    transport: class {
      constructor() {}
    },
  },
});

const toBookRow = (b, index) => ({
  slug: b.slug,
  title: b.title,
  title_urdu: b.titleUrdu || "",
  type: b.type,
  type_label: b.typeLabel || "",
  badge: b.badge || "",
  cover: b.cover || "",
  hero: b.hero || "",
  tagline: b.tagline || "",
  cta_label: b.ctaLabel || "",
  pdf: b.pdf || "",
  description: b.description || "",
  description_ur: b.descriptionUr || "",
  author_note: b.authorNote || "",
  excerpt_ur: b.excerpt?.ur || "",
  excerpt_source: b.excerpt?.source || "",
  excerpt_episode_slug: b.excerpt?.episodeSlug || "",
  quote_ur: b.quote?.ur || "",
  quote_en: b.quote?.en || "",
  quote_source: b.quote?.source || "",
  genres: b.genres || [],
  for_you: b.forYou || [],
  reading_tips: b.readingTips || [],
  rating_avg: b.rating?.avg ?? 0,
  rating_count: b.rating?.count ?? 0,
  rating_dist: b.rating?.dist || [0, 0, 0, 0, 0],
  more_episodes_coming: !!b.moreEpisodesComing,
  content_placeholder: !!b.contentPlaceholder,
  placeholder_copy: !!b.placeholderCopy,
  home_visible: true,
  home_order: index,
});

async function seed() {
  console.log("Seeding books...");
  for (const [index, b] of books.entries()) {
    const row = toBookRow(b, index);
    const { error } = await db.from("books").upsert(row, { onConflict: "slug" });
    if (error) throw new Error(`books: ${b.slug} -> ${error.message}`);

    // Episodes: replace existing episodes for this book
    await db.from("episodes").delete().eq("book_slug", b.slug);
    if (b.episodes?.length) {
      const epRows = b.episodes.map((ep, i) => ({
        book_slug: b.slug,
        slug: ep.slug,
        episode_number: i + 1,
        title: ep.title || "",
        urdu_title: ep.urduTitle || "",
        teaser_ur: ep.teaserUr || "",
        synopsis: ep.synopsis || "",
        closing_line_ur: ep.closingLineUr || "",
        pdf: ep.pdf || "",
        read_time: ep.readTime || "",
      }));
      const { error: epError } = await db.from("episodes").insert(epRows);
      if (epError) throw new Error(`episodes: ${b.slug} -> ${epError.message}`);
    }

    // Reviews: only seed if the book has none yet (don't clobber real ones)
    const { count } = await db
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("book_slug", b.slug);
    if ((count ?? 0) === 0 && b.reviews?.length) {
      const reviewRows = b.reviews.map((r) => ({
        book_slug: b.slug,
        name: r.name || "",
        when_display: r.when || "",
        rating: r.rating ?? 5,
        text: r.text || "",
        approved: true,
        featured: false,
      }));
      const { error: rError } = await db.from("reviews").insert(reviewRows);
      if (rError) throw new Error(`reviews: ${b.slug} -> ${rError.message}`);
    }
  }

  console.log("Seeding prebooking...");
  for (const [slug, ed] of Object.entries(EDITION_DETAILS)) {
    const { error } = await db.from("prebooking").upsert(
      {
        book_slug: slug,
        price: ed.price ?? null,
        status: ed.price == null ? "coming-soon" : "prebooking",
        note: ed.note || "",
        pitch: ed.pitch || "",
        points: ed.points || [],
        show_on_store: true,
      },
      { onConflict: "book_slug" }
    );
    if (error) throw new Error(`prebooking: ${slug} -> ${error.message}`);
  }

  console.log("Seeding testimonials (only if empty)...");
  const { count: tCount } = await db
    .from("testimonials")
    .select("id", { count: "exact", head: true });
  if ((tCount ?? 0) === 0) {
    const rows = testimonials.map((t, i) => ({
      quote: t.quote,
      source: t.source,
      active: true,
      sort_order: i,
    }));
    const { error } = await db.from("testimonials").insert(rows);
    if (error) throw new Error(`testimonials -> ${error.message}`);
  }

  console.log("Seeding home settings...");
  const { error: hError } = await db.from("home_settings").upsert({
    id: 1,
    hero_slugs: heroSlides.map((b) => b.slug),
    episodic_slugs: [],
    short_novel_slugs: [],
    afsana_slugs: [],
    hero_autoplay_ms: 6500,
    reviews_lede: "Sample entries below — swap in real reader reviews and names.",
    quote_text:
      "Their pain matters, their story matters —\nand they are never alone.",
    quote_cite: "— Zoha Asif",
    faqs: faqs,
  });
  if (hError) throw new Error(`home_settings -> ${hError.message}`);

  console.log("Done. Seeded", books.length, "books.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
