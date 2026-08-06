# Zoha Asif — Author Website (Frontend, static/mock-data build)

Next.js 14 (App Router). This is the **frontend-lock milestone**: every homepage
section is built and styled with real brand assets, using static/mock data from
`lib/books.js` instead of a live backend. Once the design is approved, the plan
(per the Scope of Work) is to wire this to the FastAPI + PostgreSQL backend —
the component structure and data shape are already set up for that swap.

## Run it

```
npm install
npm run dev
```

Open http://localhost:3000

## What's real vs. placeholder

- Real: all 6 covers, 6 hero images, 4 logo variants, full Cormorant Garamond +
  Lora font families, brand colors, all copy carried over from the approved
  prototype.
- Placeholder (flagged in the UI with a small pink "placeholder" tag, and in
  `lib/books.js` comments): Tadbeer's synopsis, and the author portrait (using
  the logo mark as a stand-in circle). Swap these the moment real assets/copy
  arrive — see Scope of Work Section 6.2.

## Structure

- `app/page.js` — homepage, assembles all sections in the approved order
- `components/` — one file per section (Hero, AuthorIntro, EpisodicNovels, etc.)
- `lib/books.js` — all book/review/FAQ content in one place; this is what gets
  replaced by real API calls in the next phase
- `app/globals.css` — all styling, brand tokens as CSS variables at the top
- `public/` — fonts, covers, hero art, logos

## Known open design decision

Hero panels show a category label + CTA buttons only — no duplicate headline —
since your hero images already have the title beautifully baked into the
artwork. On mobile, the coded title reappears (cropped view hides the baked-in
one there) so it's never missing, just not doubled on desktop. Flag it if you'd
rather have the headline coded on desktop too.

## Not in this milestone

Individual novel/episode pages (`/novels/[slug]`), the episode reader, cart/
checkout, the admin panel, and the FastAPI/PostgreSQL backend — all Phase 2+
per the Scope of Work timeline.
