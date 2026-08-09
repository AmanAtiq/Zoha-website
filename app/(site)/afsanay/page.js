import CollectionPage from "../../../components/CollectionPage";
import { getBooks } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Afsanay — Zoha Asif",
  description: "Discover short stories by Zoha Asif carrying big, unspoken feelings.",
};

export default async function AfsanayPage() {
  const books = await getBooks();
  return <CollectionPage type="afsana" items={books.filter((b) => b.type === "afsana")} />;
}
