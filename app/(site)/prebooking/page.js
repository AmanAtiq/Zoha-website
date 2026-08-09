import PrebookingStore from "../../../components/PrebookingStore";
import { getPrebooking } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prebooking — Zoha Asif",
  description: "Reserve physical first-print editions of Zoha Asif's books.",
};

export default async function PrebookingPage() {
  const items = await getPrebooking();
  return <PrebookingStore items={items} />;
}
