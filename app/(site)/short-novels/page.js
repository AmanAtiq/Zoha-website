import CollectionPage from "../../../components/CollectionPage";
import { getCatalogBooks } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Short Novels — Zoha Asif",
  description: "Read Zoha Asif's complete short novels in one sitting.",
};

export default async function ShortNovelsPage() {
  const books = await getCatalogBooks();
  return <CollectionPage type="short-novel" items={books.filter((b) => b.type === "short-novel")} />;
}
