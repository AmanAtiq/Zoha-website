"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "../lib/prebooking";

const BASKET_STORAGE_KEY = "zoha-prebooking-basket";
const BASKET_EVENT = "zoha-prebooking-basket-change";

export default function PrebookingCart() {
  const [basket, setBasket] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const syncBasket = () => {
      const savedBasket = window.localStorage.getItem(BASKET_STORAGE_KEY);
      setBasket(savedBasket ? JSON.parse(savedBasket) : []);
      setIsReady(true);
    };
    syncBasket();
    window.addEventListener(BASKET_EVENT, syncBasket);
    window.addEventListener("storage", syncBasket);
    return () => {
      window.removeEventListener(BASKET_EVENT, syncBasket);
      window.removeEventListener("storage", syncBasket);
    };
  }, []);

  const updateQuantity = (slug, change) => {
    const nextBasket = basket
      .map((item) => item.slug === slug ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0);
    setBasket(nextBasket);
    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(nextBasket));
    window.dispatchEvent(new Event(BASKET_EVENT));
  };

  const submitReservation = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    setBasket([]);
    window.localStorage.removeItem(BASKET_STORAGE_KEY);
    window.dispatchEvent(new Event(BASKET_EVENT));
  };

  const basketCount = basket.reduce((total, item) => total + item.quantity, 0);
  const basketTotal = basket.reduce((total, item) => total + item.price * item.quantity, 0);

  if (!isReady) return <main className="cart-page" />;

  return (
    <main className="cart-page">
      <section className="cart-hero">
        <div className="container cart-hero-inner">
          <p className="eyebrow eyebrow--dark">Your reading shelf</p>
          <h1>Cart & checkout</h1>
          <p>Review your physical editions, then send your reservation request in one simple step.</p>
        </div>
      </section>

      {isSubmitted ? (
        <section className="section cart-success-section">
          <div className="container cart-success">
            <span className="cart-success-mark">✓</span>
            <p className="eyebrow eyebrow--dark">Reservation received</p>
            <h2>Your stories are on their way to being yours.</h2>
            <p>We&apos;ll contact you shortly to confirm availability, payment, and delivery details.</p>
            <a href="/prebooking" className="btn btn-primary">Continue browsing</a>
          </div>
        </section>
      ) : basket.length === 0 ? (
        <section className="section cart-empty-section">
          <div className="container cart-empty">
            <p className="eyebrow eyebrow--dark">Nothing here yet</p>
            <h2>Choose a story for your shelf.</h2>
            <p>Your cart will keep your physical-edition reservations together while you browse.</p>
            <a href="/prebooking" className="btn btn-primary">Browse prebooking</a>
          </div>
        </section>
      ) : (
        <section className="section cart-content">
          <div className="container cart-layout">
            <div className="cart-items">
              <div className="cart-section-heading">
                <h2>Your editions</h2>
                <span>{basketCount} {basketCount === 1 ? "book" : "books"}</span>
              </div>
              {basket.map((item) => (
                <article className="cart-item" key={item.slug}>
                  <div className="cart-item-placeholder" aria-hidden="true">ZA</div>
                  <div className="cart-item-details">
                    <h3>{item.title}</h3>
                    <p>Physical first-print edition</p>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>
                  <div className="cart-quantity">
                    <button type="button" onClick={() => updateQuantity(item.slug, -1)} aria-label={`Remove one ${item.title}`}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.slug, 1)} aria-label={`Add one ${item.title}`}>+</button>
                  </div>
                  <strong className="cart-item-total">{formatPrice(item.price * item.quantity)}</strong>
                </article>
              ))}
              <a className="cart-continue-link" href="/prebooking">← Continue shopping</a>
            </div>

            <aside className="cart-checkout-card">
              <p className="eyebrow eyebrow--dark">Reservation details</p>
              <h2>Ready to make it yours?</h2>
              <div className="cart-summary-line"><span>Books</span><strong>{formatPrice(basketTotal)}</strong></div>
              <div className="cart-summary-line"><span>Delivery</span><span>Confirmed with you</span></div>
              <div className="cart-summary-total"><span>Estimated total</span><strong>{formatPrice(basketTotal)}</strong></div>
              <p className="cart-checkout-note">This is a reservation request. We&apos;ll confirm stock, final delivery charges, and payment with you before fulfilling the order.</p>
              <form className="cart-checkout-form" onSubmit={submitReservation}>
                <label htmlFor="cart-name">Full name</label>
                <input id="cart-name" required placeholder="Your name" />
                <label htmlFor="cart-contact">Email or WhatsApp</label>
                <input id="cart-contact" required placeholder="How should we reach you?" />
                <label htmlFor="cart-address">Delivery address</label>
                <textarea id="cart-address" required rows={3} placeholder="City and full address" />
                <button type="submit" className="btn btn-primary">Proceed with reservation</button>
              </form>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
