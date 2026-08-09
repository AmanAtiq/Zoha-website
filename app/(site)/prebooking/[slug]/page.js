import { notFound } from "next/navigation";
import PrebookingDetail from "../../../../components/PrebookingDetail";
import { getPrebookingFor } from "../../../../lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const entry = await getPrebookingFor(params.slug);
  return entry
    ? { title: `${entry.book.title} — Prebooking`, description: `Reserve the physical first print of ${entry.book.title}.` }
    : {};
}

export default async function PrebookingDetailPage({ params }) {
  const entry = await getPrebookingFor(params.slug);
  if (!entry) notFound();
  return <PrebookingDetail book={entry.book} edition={entry.edition} />;
}
