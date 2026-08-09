import { notFound } from "next/navigation";
import { getBookBySlug, getBooks } from "../../../../lib/data";
import EpisodicHub from "../../../../components/EpisodicHub";
import StandaloneDetail from "../../../../components/StandaloneDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const book = await getBookBySlug(params.slug);
  if (!book) return {};
  return {
    title: `${book.title} — Zoha Asif`,
    description: book.tagline,
  };
}

export default async function BookDetailPage({ params }) {
  const book = await getBookBySlug(params.slug);
  if (!book) notFound();

  const allBooks = await getBooks();
  book.more = allBooks.filter((b) => b.slug !== book.slug).slice(0, 4);

  if (book.type === "episodic") {
    return <EpisodicHub book={book} />;
  }

  return <StandaloneDetail book={book} />;
}
