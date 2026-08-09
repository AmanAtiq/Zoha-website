import CollectionPage from "../../../components/CollectionPage";
import { getBooks } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Episodic Novels — Zoha Asif",
  description: "Follow Zoha Asif's episodic novels as each story unfolds chapter by chapter.",
};

export default async function EpisodicNovelsPage() {
  const books = await getBooks();
  return <CollectionPage type="episodic" items={books.filter((b) => b.type === "episodic")} />;
}
