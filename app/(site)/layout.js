import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getCatalogBooks } from "../../lib/data";

export default async function SiteLayout({ children }) {
  const books = await getCatalogBooks();
  const availableSections = [...new Set(books.map((book) => book.type))];

  return (
    <>
      <Header availableSections={availableSections} />
      {children}
      <Footer />
    </>
  );
}
