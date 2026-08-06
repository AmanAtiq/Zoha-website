import { notFound } from "next/navigation";
import PrebookingDetail from "../../../components/PrebookingDetail";
import { books } from "../../../lib/books";

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export function generateMetadata({ params }) {
  const book = books.find((entry) => entry.slug === params.slug);
  return book
    ? { title: `${book.title} — Prebooking`, description: `Reserve the physical first print of ${book.title}.` }
    : {};
}

export default function PrebookingDetailPage({ params }) {
  const book = books.find((entry) => entry.slug === params.slug);
  if (!book) notFound();
  return <PrebookingDetail book={book} />;
}
