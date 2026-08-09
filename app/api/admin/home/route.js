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

export async function GET() {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const [settingsRes, testRes, booksRes] = await Promise.all([
    admin.from("home_settings").select("*").eq("id", 1).maybeSingle(),
    admin.from("testimonials").select("*").order("sort_order", { ascending: true }),
    admin.from("books").select("slug, title, type, type_label, cover, home_visible, home_order").order("home_order", { ascending: true }),
  ]);

  // Show what's actually live on the site even before the DB is seeded: the
  // panel is never blank. DB rows take precedence once they exist.
  const settings = settingsRes.data
    ? {
        heroSlugs: settingsRes.data.hero_slugs || [],
        episodicSlugs: settingsRes.data.episodic_slugs || [],
        shortNovelSlugs: settingsRes.data.short_novel_slugs || [],
        afsanaSlugs: settingsRes.data.afsana_slugs || [],
        heroAutoplayMs: settingsRes.data.hero_autoplay_ms ?? 6500,
        heroLede: settingsRes.data.hero_lede || "",
        reviewsLede: settingsRes.data.reviews_lede || "",
        quoteText: settingsRes.data.quote_text || "",
        quoteCite: settingsRes.data.quote_cite || "",
        authorIntro: {
          ...DEFAULT_AUTHOR_INTRO,
          ...(settingsRes.data.author_intro || {}),
        },
        faqs: settingsRes.data.faqs || [],
      }
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
  }));
  const books = dbBooks.length ? dbBooks : getSeedBooksForAdmin().map((b) => ({
    slug: b.slug,
    title: b.title,
    type: b.type,
    type_label: b.typeLabel || "",
    cover: b.cover || "",
    home_visible: b.homeVisible,
    home_order: b.homeOrder,
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
  const sectionClamp = (slugs, type) => {
    const limit = type === "episodic" ? 1 : type === "short-novel" ? 2 : 3;
    return (slugs || []).slice(0, limit);
  };

  const { error } = await admin.from("home_settings").upsert(
    {
      id: 1,
      hero_slugs: s.heroSlugs ?? [],
      episodic_slugs: sectionClamp(s.episodicSlugs, "episodic"),
      short_novel_slugs: sectionClamp(s.shortNovelSlugs, "short-novel"),
      afsana_slugs: sectionClamp(s.afsanaSlugs, "afsana"),
      hero_autoplay_ms: Number(s.heroAutoplayMs) || 6500,
      hero_lede: s.heroLede || "",
      reviews_lede: s.reviewsLede || "",
      quote_text: s.quoteText || "",
      quote_cite: s.quoteCite || "",
      author_intro: s.authorIntro || {},
      faqs: s.faqs || [],
    },
    { onConflict: "id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
