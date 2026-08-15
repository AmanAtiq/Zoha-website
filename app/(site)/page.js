import { getHome } from "../../lib/data";
import Hero from "../../components/Hero";
import AuthorIntro from "../../components/AuthorIntro";
import EpisodicNovels from "../../components/EpisodicNovels";
import ShortNovels from "../../components/ShortNovels";
import Afsanay from "../../components/Afsanay";
import Quote from "../../components/Quote";
import Reviews from "../../components/Reviews";
import Newsletter from "../../components/Newsletter";
import FAQ from "../../components/FAQ";
import Socials from "../../components/Socials";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await getHome();

  return (
    <main className="home-page">
      <Hero
        slides={home.heroSlides}
        autoplayMs={home.heroAutoplayMs}
        lede={home.heroLede}
      />
      <AuthorIntro intro={home.authorIntro} />
      {home.episodic.length > 0 && <EpisodicNovels items={home.episodic} />}
      {home.shortNovels.length > 0 && <ShortNovels items={home.shortNovels} />}
      {home.afsanay.length > 0 && <Afsanay items={home.afsanay} />}
      <Quote quotes={home.quotes} text={home.quoteText} cite={home.quoteCite} />
      <Reviews testimonials={home.testimonials} lede={home.reviewsLede} />
      <Newsletter />
      <FAQ faqs={home.faqs} />
      <Socials />
    </main>
  );
}
