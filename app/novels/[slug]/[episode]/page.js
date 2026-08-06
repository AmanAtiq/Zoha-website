import { notFound } from "next/navigation";
import { books, getBySlug, getEpisode } from "../../../../lib/books";
import EpisodePage from "../../../../components/EpisodePage";

export function generateStaticParams() {
  return books
    .filter((b) => b.type === "episodic")
    .flatMap((b) => b.episodes.map((ep) => ({ slug: b.slug, episode: ep.slug })));
}

export function generateMetadata({ params }) {
  const book = getBySlug(params.slug);
  if (!book || book.type !== "episodic") return {};
  const episode = getEpisode(book, params.episode);
  if (!episode) return {};
  return {
    title: `${episode.title} — ${book.title} — Zoha Asif`,
    description: episode.synopsis,
  };
}

export default function Page({ params }) {
  const book = getBySlug(params.slug);
  if (!book || book.type !== "episodic") notFound();

  const episode = getEpisode(book, params.episode);
  if (!episode) notFound();

  const index = book.episodes.findIndex((e) => e.slug === episode.slug);

  return <EpisodePage book={book} episode={episode} index={index} />;
}
