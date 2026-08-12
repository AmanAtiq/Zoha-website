import CollectionPage from "../../../components/CollectionPage";
import { getCollection } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Episodic Novels — Zoha Asif",
  description: "Follow Zoha Asif's episodic novels as each story unfolds chapter by chapter.",
};

export default async function EpisodicNovelsPage() {
  const { items, heroSlides } = await getCollection("episodic");
  return <CollectionPage type="episodic" items={items} heroSlides={heroSlides} />;
}
