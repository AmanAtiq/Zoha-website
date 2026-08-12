import CollectionPage from "../../../components/CollectionPage";
import { getCollection } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Short Novels — Zoha Asif",
  description: "Read Zoha Asif's complete short novels in one sitting.",
};

export default async function ShortNovelsPage() {
  const { items, heroSlides } = await getCollection("short-novel");
  return <CollectionPage type="short-novel" items={items} heroSlides={heroSlides} />;
}
