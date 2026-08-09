import { notFound } from "next/navigation";
import { getBookBySlug } from "../../../../../lib/data";
import EpisodePage from "../../../../../components/EpisodePage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const book = await getBookBySlug(params.slug);
  if (!book || book.type !== "episodic") return {};
  const episode = book.episodes.find((e) => e.slug === params.episode);
  if (!episode) return {};
  return {
    title: `${episode.title} — ${book.title} — Zoha Asif`,
    description: episode.synopsis,
  };
}

export default async function Page({ params }) {
  const book = await getBookBySlug(params.slug);
  if (!book || book.type !== "episodic") notFound();

  const episode = book.episodes.find((e) => e.slug === params.episode);
  if (!episode) notFound();

  const index = book.episodes.findIndex((e) => e.slug === episode.slug);

  return <EpisodePage book={book} episode={episode} index={index} />;
}
