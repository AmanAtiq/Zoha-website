"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/episodic-novels", label: "Episodic Novels", type: "episodic" },
  { href: "/short-novels", label: "Short Novels", type: "short-novel" },
  { href: "/afsanay", label: "Afsanay", type: "afsana" },
  { href: "/#about", label: "About" },
  { href: "/prebooking", label: "Prebooking" },
];

export default function Header({ availableSections = [] }) {
  const visibleNavLinks = NAV_LINKS.filter((link) => !link.type || availableSections.includes(link.type));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncCartCount = () => {
      const savedBasket = window.localStorage.getItem("zoha-prebooking-basket");
      const basket = savedBasket ? JSON.parse(savedBasket) : [];
      setCartCount(basket.reduce((total, item) => total + item.quantity, 0));
    };
    syncCartCount();
    window.addEventListener("zoha-prebooking-basket-change", syncCartCount);
    window.addEventListener("storage", syncCartCount);
    return () => {
      window.removeEventListener("zoha-prebooking-basket-change", syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container header-inner">
        <a href="/#hero" className="logo" aria-label="Zoha Asif — Home">
          <img className="logo-mark" src="/images/logo/logo-maroon-bg.png" alt="" />
          <span className="logo-name">Zoha Asif</span>
        </a>

        <nav className={`main-nav${open ? " is-open" : ""}`} aria-label="Primary">
          <ul>
            {visibleNavLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            {cartCount > 0 && (
              <li>
                <a href="/cart" className="nav-cart" onClick={() => setOpen(false)} aria-label={`Cart with ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
                  <svg className="nav-cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6.2" />
                    <circle cx="9" cy="20" r="1.2" />
                    <circle cx="18" cy="20" r="1.2" />
                  </svg>
                  <span className="nav-cart-count">{cartCount}</span>
                </a>
              </li>
            )}
            <li>
              <a href="/#socials" className="nav-cta" onClick={() => setOpen(false)}>
                Connect
              </a>
            </li>
          </ul>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mainNav"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
