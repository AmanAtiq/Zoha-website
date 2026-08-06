import Hero from "../components/Hero";
import AuthorIntro from "../components/AuthorIntro";
import EpisodicNovels from "../components/EpisodicNovels";
import ShortNovels from "../components/ShortNovels";
import Afsanay from "../components/Afsanay";
import Quote from "../components/Quote";
import Reviews from "../components/Reviews";
import Newsletter from "../components/Newsletter";
import FAQ from "../components/FAQ";
import Socials from "../components/Socials";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <AuthorIntro />
      <EpisodicNovels />
      <ShortNovels />
      <Afsanay />
      <Quote />
      <Reviews />
      <Newsletter />
      <FAQ />
      <Socials />
    </main>
  );
}
