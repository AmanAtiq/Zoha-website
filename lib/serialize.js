// Converters between the frontend book shape (camelCase, nested — see
// lib/books.js) and the flat Supabase row shape (snake_case).

export const TYPE_LABELS = {
  episodic: "Episodic Novel",
  "short-novel": "Short Novel",
  afsana: "Afsana",
};

export function rowToEpisode(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    title: row.title,
    urduTitle: row.urdu_title,
    teaserUr: row.teaser_ur,
    synopsis: row.synopsis,
    closingLineUr: row.closing_line_ur,
    pdf: row.pdf,
    readTime: row.read_time || undefined,
    completed: row.completed || false,
  };
}

export function episodeToRow(ep, bookSlug, number) {
  return {
    book_slug: bookSlug,
    slug: ep.slug,
    episode_number: number,
    title: ep.title || "",
    urdu_title: ep.urduTitle || "",
    teaser_ur: ep.teaserUr || "",
    synopsis: ep.synopsis || "",
    closing_line_ur: ep.closingLineUr || "",
    pdf: ep.pdf || "",
    read_time: ep.readTime || "",
    completed: ep.completed || false,
  };
}

export function rowToReview(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookSlug: row.book_slug,
    name: row.name,
    when: row.when_display,
    rating: row.rating,
    text: row.text,
    approved: row.approved,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

export function rowToBook(row, episodes = [], reviews = []) {
  if (!row) return null;
  const hasExcerpt = Boolean(row.excerpt_ur);
  const hasQuote = Boolean(row.quote_ur);
  const hasRating =
    Number(row.rating_avg) > 0 || Number(row.rating_count) > 0;

  return {
    slug: row.slug,
    title: row.title,
    titleUrdu: row.title_urdu || "",
    type: row.type,
    typeLabel: row.type_label || TYPE_LABELS[row.type] || "",
    badge: row.badge || "",
    cover: row.cover || "",
    hero: row.hero || "",
    tagline: row.tagline || "",
    ctaLabel: row.cta_label || "",
    pdf: row.pdf || "",
    description: row.description || "",
    descriptionUr: row.description_ur || "",
    authorNote: row.author_note || "",
    excerpt: hasExcerpt
      ? {
          ur: row.excerpt_ur,
          source: row.excerpt_source || "",
          episodeSlug: row.excerpt_episode_slug || undefined,
        }
      : undefined,
    genres: row.genres || [],
    forYou: row.for_you || [],
    readingTips: row.reading_tips || [],
    rating: hasRating
      ? {
          avg: Number(row.rating_avg),
          count: row.rating_count || 0,
          dist: row.rating_dist || [0, 0, 0, 0, 0],
        }
      : undefined,
    quote: hasQuote
      ? { ur: row.quote_ur, en: row.quote_en || "", source: row.quote_source || "" }
      : undefined,
    moreEpisodesComing: row.more_episodes_coming,
    contentPlaceholder: row.content_placeholder,
    placeholderCopy: row.placeholder_copy,
    homeVisible: row.home_visible,
    homeOrder: row.home_order,
    episodes: (episodes || []).map(rowToEpisode),
    reviews: (reviews || []).map(rowToReview),
  };
}

export function bookToRow(book) {
  const excerpt = book.excerpt || {};
  const quote = book.quote || {};
  const rating = book.rating || {};
  return {
    slug: book.slug,
    title: book.title || "",
    title_urdu: book.titleUrdu || "",
    type: book.type || "short-novel",
    type_label: book.typeLabel || TYPE_LABELS[book.type] || "",
    badge: book.badge || "",
    cover: book.cover || "",
    hero: book.hero || "",
    tagline: book.tagline || "",
    cta_label: book.ctaLabel || "",
    pdf: book.pdf || "",
    description: book.description || "",
    description_ur: book.descriptionUr || "",
    author_note: book.authorNote || "",
    excerpt_ur: excerpt.ur || "",
    excerpt_source: excerpt.source || "",
    excerpt_episode_slug: excerpt.episodeSlug || "",
    quote_ur: quote.ur || "",
    quote_en: quote.en || "",
    quote_source: quote.source || "",
    genres: book.genres || [],
    for_you: book.forYou || [],
    reading_tips: book.readingTips || [],
    rating_avg: rating.avg ?? 0,
    rating_count: rating.count ?? 0,
    rating_dist: rating.dist || [0, 0, 0, 0, 0],
    more_episodes_coming: !!book.moreEpisodesComing,
    content_placeholder: !!book.contentPlaceholder,
    placeholder_copy: !!book.placeholderCopy,
    home_visible: book.homeVisible ?? true,
    home_order: book.homeOrder ?? 0,
  };
}

export function rowToTestimonial(row) {
  return {
    id: row.id,
    quote: row.quote,
    source: row.source,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export function rowToPrebooking(row) {
  if (!row) return null;
  return {
    bookSlug: row.book_slug,
    price: row.price == null ? null : Number(row.price),
    status: row.status,
    note: row.note || "",
    pitch: row.pitch || "",
    points: row.points || [],
    showOnStore: row.show_on_store,
    isComingSoon: row.status === "coming-soon" || row.price == null,
  };
}

export function prebookingToRow(p) {
  return {
    book_slug: p.bookSlug,
    price: p.price,
    status: p.status,
    note: p.note || "",
    pitch: p.pitch || "",
    points: p.points || [],
    show_on_store: p.showOnStore ?? true,
  };
}
