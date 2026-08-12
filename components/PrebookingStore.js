"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "../lib/prebooking";

const BASKET_STORAGE_KEY = "zoha-prebooking-basket";
const BASKET_EVENT = "zoha-prebooking-basket-change";

export default function PrebookingStore({ items = [] }) {
  const [basket, setBasket] = useState([]);
  const [isBasketReady, setIsBasketReady] = useState(false);

  useEffect(() => {
    const savedBasket = window.localStorage.getItem(BASKET_STORAGE_KEY);
    if (savedBasket) setBasket(JSON.parse(savedBasket));
    setIsBasketReady(true);

    const syncBasket = () => {
      const nextBasket = window.localStorage.getItem(BASKET_STORAGE_KEY);
      setBasket(nextBasket ? JSON.parse(nextBasket) : []);
    };
    window.addEventListener(BASKET_EVENT, syncBasket);
    return () => window.removeEventListener(BASKET_EVENT, syncBasket);
  }, []);

  useEffect(() => {
    if (!isBasketReady) return;
    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  }, [basket, isBasketReady]);

  const basketCount = basket.reduce((total, item) => total + item.quantity, 0);

  const addToBasket = (book, edition) => {
    setBasket((current) => {
      const existing = current.find((item) => item.slug === book.slug);
      const nextBasket = existing
        ? current.map((item) =>
            item.slug === book.slug ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [
            ...current,
            {
              slug: book.slug,
              title: book.title,
              price: edition.price,
              quantity: 1,
            },
          ];
      window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(nextBasket));
      window.dispatchEvent(new Event(BASKET_EVENT));
      return nextBasket;
    });
  };

  const featuredBook = useMemo(
    () => (items.find((item) => item.book.slug === "tu-sawera-mera") || items[0])?.book,
    [items]
  );

  if (!featuredBook) return <main className="prebooking-page" />;

  return (
    <main className="prebooking-page">
      <section className="prebooking-hero">
        <div className="container prebooking-hero-inner">
          <div className="prebooking-hero-copy">
            <p className="eyebrow eyebrow--dark">The physical shelf</p>
            <h1>Stories to hold on to.</h1>
            <p className="prebooking-hero-lede">
              Bring Zoha&apos;s stories home in beautifully made first-print editions, reserved before they leave the press.
            </p>
            <a className="btn btn-primary" href="#editions">Explore editions</a>
          </div>
          <div className="prebooking-hero-feature">
            <img src={featuredBook.cover} alt={`${featuredBook.title} physical edition`} />
            <div className="prebooking-hero-note">
              <span>Now taking reservations</span>
              <strong>First print collection</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="prebooking-benefits" aria-label="Prebooking benefits">
        <div className="container prebooking-benefits-grid">
          <div><span className="benefit-number">01</span><strong>Reserve early</strong><p>Secure your copy before the first print sells out.</p></div>
          <div><span className="benefit-number">02</span><strong>Made with care</strong><p>Thoughtful paper, cover finishes, and a personal touch.</p></div>
          <div><span className="benefit-number">03</span><strong>Delivered home</strong><p>Share your details once and we&apos;ll take it from there.</p></div>
        </div>
      </section>

      <section className="section prebooking-editions" id="editions">
        <div className="container">
          <div className="section-head prebooking-section-head">
            <div>
              <p className="eyebrow eyebrow--dark">Choose your story</p>
              <h2>Prebook the first print</h2>
            </div>
            <p className="section-lede">A small collection for readers who want more than a bookmark on a screen.</p>
          </div>

          <div className="prebooking-grid">
            {items.map(({ book, edition }) => (
              <article className="prebooking-card" key={book.slug}>
                <a className="prebooking-cover" href={`/prebooking/${book.slug}`}>
                  <img src={book.cover} alt={`${book.title} cover`} />
                </a>
                <div className="prebooking-card-body">
                  <div className="prebooking-card-title-row">
                    <div>
                      <h3><a href={`/prebooking/${book.slug}`}>{book.title}</a></h3>
                      <p className="prebooking-urdu" lang="ur" dir="rtl">{book.titleUrdu}</p>
                    </div>
                    {edition.isComingSoon ? (
                      <strong className="prebooking-coming-soon">Coming soon</strong>
                    ) : (
                      <strong className="prebooking-price">{formatPrice(edition.price)}</strong>
                    )}
                  </div>
                  <p className="prebooking-card-note">{edition.note}</p>
                  <button
                    type="button"
                    className="btn btn-outline-dark prebooking-add"
                    disabled={edition.isComingSoon}
                    onClick={() => addToBasket(book, edition)}
                  >
                    {edition.isComingSoon ? "Not yet available" : "Add to cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="prebooking-order-band" id="reservation">
        <div className="container prebooking-order-inner">
          <div>
            <p className="eyebrow">Your reading shelf</p>
            <h2>Reserve a story before it arrives.</h2>
            <p>Prebooking is a reservation request for now. We&apos;ll confirm availability and delivery details with you before payment.</p>
          </div>
          <a className={`btn btn-primary prebooking-basket-button${!basketCount ? " is-disabled" : ""}`} href={basketCount ? "/cart" : "/prebooking#editions"}>
            {basketCount ? `Review cart · ${basketCount}` : "Add a book to begin"}
          </a>
        </div>
      </section>

    </main>
  );
}
