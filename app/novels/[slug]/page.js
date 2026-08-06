import { notFound } from "next/navigation";
import { books, getBySlug } from "../../../lib/books";
import EpisodicHub from "../../../components/EpisodicHub";
import StandaloneDetail from "../../../components/StandaloneDetail";

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export function generateMetadata({ params }) {
  const book = getBySlug(params.slug);
  if (!book) return {};
  return {
    title: `${book.title} — Zoha Asif`,
    description: book.tagline,
  };
}

export default function BookDetailPage({ params }) {
  const book = getBySlug(params.slug);
  if (!book) notFound();

  if (book.type === "episodic") {
    return <EpisodicHub book={book} />;
  }

  return <StandaloneDetail book={book} />;
}
