import localFont from "next/font/local";

// Heading / display face — brand guide: "Caramont Sc" reads as Cormorant Garamond
export const cormorant = localFont({
  src: [
    { path: "../public/fonts/CormorantGaramond-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/CormorantGaramond-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/CormorantGaramond-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/CormorantGaramond-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

// Body face — brand guide: Lora (confirmed match)
export const lora = localFont({
  src: [
    { path: "../public/fonts/Lora-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Lora-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Lora-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Lora-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Lora-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

// Urdu face — Nastaliq script for all titleUrdu / excerpt / quote text
export const notoNastaliq = localFont({
  src: [
    { path: "../public/fonts/NotoNastaliqUrdu-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoNastaliqUrdu-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/NotoNastaliqUrdu-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/NotoNastaliqUrdu-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-urdu",
  display: "swap",
});
