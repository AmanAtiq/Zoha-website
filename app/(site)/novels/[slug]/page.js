import { notFound, redirect } from "next/navigation";
import { getBookBySlug, getCatalogBooks } from "../../../../lib/data";
import EpisodicHub from "../../../../components/EpisodicHub";
import StandaloneDetail from "../../../../components/StandaloneDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const book = await getBookBySlug(params.slug);
  if (!book || book.prebookOnly) return {};
  return {
    title: `${book.title} — Zoha Asif`,
    description: book.tagline,
  };
}

export default async function BookDetailPage({ params }) {
  const book = await getBookBySlug(params.slug);
  if (!book) notFound();
  if (book.prebookOnly) redirect(`/prebooking/${book.slug}`);

  const allBooks = await getCatalogBooks();
  book.more = allBooks.filter((b) => b.slug !== book.slug).slice(0, 4);

  if (book.type === "episodic") {
    return <EpisodicHub book={book} />;
  }

  return <StandaloneDetail book={book} />;
}
