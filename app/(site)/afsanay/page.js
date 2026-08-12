import CollectionPage from "../../../components/CollectionPage";
import { getCollection } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Afsanay — Zoha Asif",
  description: "Discover short stories by Zoha Asif carrying big, unspoken feelings.",
};

export default async function AfsanayPage() {
  const { items, heroSlides } = await getCollection("afsana");
  return <CollectionPage type="afsana" items={items} heroSlides={heroSlides} />;
}
