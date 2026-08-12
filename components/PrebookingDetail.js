"use client";

import { useState } from "react";
import { formatPrice } from "../lib/prebooking";

const BASKET_STORAGE_KEY = "zoha-prebooking-basket";
const BASKET_EVENT = "zoha-prebooking-basket-change";

export default function PrebookingDetail({ book, edition }) {
  const [added, setAdded] = useState(false);
  const comingSoon = edition?.isComingSoon;
  const priceLabel = comingSoon ? "Coming soon" : formatPrice(edition.price);

  const addToBasket = () => {
    if (comingSoon) return;
    const savedBasket = window.localStorage.getItem(BASKET_STORAGE_KEY);
    const currentBasket = savedBasket ? JSON.parse(savedBasket) : [];
    const existing = currentBasket.find((item) => item.slug === book.slug);
    const nextBasket = existing
      ? currentBasket.map((item) => item.slug === book.slug ? { ...item, quantity: item.quantity + 1 } : item)
      : [...currentBasket, { slug: book.slug, title: book.title, price: edition.price, quantity: 1 }];

    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(nextBasket));
    window.dispatchEvent(new Event(BASKET_EVENT));
    setAdded(true);
  };

  return (
    <main className="prebooking-detail-page">
      <section className="prebooking-detail-hero">
        <div className="container prebooking-detail-hero-inner">
          <a className="prebooking-back-link" href="/prebooking">← Back to all editions</a>
          <div className="prebooking-detail-layout">
            <div className="prebooking-detail-cover-wrap">
              <div className="prebooking-detail-frame" />
              <img className="prebooking-detail-cover" src={book.cover} alt={`${book.title} physical edition`} />
            </div>
            <div className="prebooking-detail-copy">
              <p className="eyebrow eyebrow--dark">Physical first print</p>
              <h1>{book.title}</h1>
              <p className="prebooking-detail-urdu" lang="ur" dir="rtl">{book.titleUrdu}</p>
              <p className="prebooking-detail-pitch">{edition.pitch}</p>
              <div className="prebooking-detail-buybox">
                <div>
                  <span className="prebooking-buybox-label">{comingSoon ? "Availability" : "Prebooking price"}</span>
                  <strong>{priceLabel}</strong>
                </div>
                <span className="prebooking-buybox-note">{edition.note}</span>
                <button type="button" className="btn btn-primary" onClick={addToBasket} disabled={comingSoon}>
                  {comingSoon ? "Coming soon" : added ? "Added to cart" : "Add to cart"}
                </button>
                {added && <a className="prebooking-view-cart" href="/cart">Review your cart →</a>}
              </div>
              <p className="prebooking-detail-reassurance">Your reservation request is confirmed with you before payment. Delivery details are collected at checkout.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section prebooking-detail-info">
        <div className="container prebooking-detail-info-grid">
          <div>
            <p className="eyebrow eyebrow--dark">Why this edition</p>
            <h2>A story worth keeping close.</h2>
            <p className="detail-prose">{book.description}</p>
          </div>
          <div className="prebooking-selling-points">
            <p className="lbl">In your first print</p>
            {edition.points.map((point, index) => (
              <div className="prebooking-selling-point" key={point}>
                <span>0{index + 1}</span>
                <strong>{point}</strong>
              </div>
            ))}
            <a className="btn btn-outline-dark prebooking-read-link" href={`/novels/${book.slug}`}>Read about the story</a>
          </div>
        </div>
      </section>

      <section className="prebooking-detail-callout">
        <div className="container">
          <p className="eyebrow">A physical reminder</p>
          <h2>For the stories you want to return to.</h2>
          <a className="btn btn-primary" href="/prebooking">Continue shopping</a>
        </div>
      </section>
    </main>
  );
}
