"use client";

import { useState } from "react";
import { faqs } from "../lib/books";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section section--tint" id="faqs">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow eyebrow--dark">Good to Know</p>
          <h2>FAQs</h2>
          <p className="section-lede">
            Ordering, delivery, formats and everything in between.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div className={`faq-item${isOpen ? " is-open" : ""}`} key={item.q}>
                <button
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
