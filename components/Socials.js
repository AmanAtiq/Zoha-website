const ICONS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/zohaa.asiff?igsh=MWRrOGMyZGtqN3NkNw%3D%3D&utm_source=qr",
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.3" cy="6.7" r="1" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BREUU8GQS/?mibextid=wwXIfr",
    path: <path d="M15 8h2V4h-2a4 4 0 0 0-4 4v2H9v4h2v6h4v-6h2.5l.5-4H15V8z" />,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/923194025988",
    path: (
      <>
        <path d="M20 11.5a8 8 0 0 1-11.85 7L4 20l1.4-4A8 8 0 1 1 20 11.5z" />
        <path d="M8.8 8.1c.2-.4.4-.4.6-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.6-.5.2-1 .3-1.5.2-2.9-.4-5.4-2.9-5.8-5.8-.1-.5 0-1 .2-1.5z" />
      </>
    ),
  },
  {
    label: "Email",
    href: "mailto:info@zohaasif.com",
    path: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  },
];

export default function Socials() {
  return (
    <section className="socials-section" id="socials">
      <div className="container">
        <p className="eyebrow">Stay Connected</p>
        <h2>Find Zoha Asif Online</h2>
        <p className="socials-lede">Follow along or get in touch.</p>

        <div className="social-icons">
          {ICONS.map((icon) => (
            <a href={icon.href} className="social-icon" aria-label={icon.label} title={icon.label} key={icon.label} target={icon.href.startsWith("http") ? "_blank" : undefined} rel={icon.href.startsWith("http") ? "noreferrer" : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {icon.path}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
