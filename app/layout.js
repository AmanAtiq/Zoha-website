import "./globals.css";
import { cormorant, lora, notoNastaliq } from "./fonts";

export const metadata = {
  title: "Zoha Asif — Author",
  description:
    "Zoha Asif — Urdu fiction author. Episodic novels, short novels and afsanay that name the feelings you were never taught how to say. Free soft copies to read or download as PDFs, hard copies delivered to your door.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable} ${notoNastaliq.variable}`}>
      <body>{children}</body>
    </html>
  );
}
