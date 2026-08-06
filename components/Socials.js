const ICONS = [
  {
    label: "Instagram",
    href: "#",
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
    href: "#",
    path: <path d="M15 8h2V4h-2a4 4 0 0 0-4 4v2H9v4h2v6h4v-6h2.5l.5-4H15V8z" />,
  },
  {
    label: "TikTok",
    href: "#",
    path: (
      <>
        <path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.47" />
        <path d="M14 4c.5 2.2 2.1 3.6 4.3 3.9" />
      </>
    ),
  },
  {
    label: "Goodreads",
    href: "#",
    path: <path d="M6 4h8a4 4 0 0 1 4 4v12l-4-2-4 2-4-2-4 2V8a4 4 0 0 1 4-4z" />,
  },
  {
    label: "YouTube",
    href: "#",
    path: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M11 10l4 2-4 2v-4z" fill="currentColor" stroke="none" />
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
        <p className="socials-lede">Replace the links below with your real profile URLs.</p>

        <div className="social-icons">
          {ICONS.map((icon) => (
            <a href={icon.href} className="social-icon" aria-label={icon.label} title={icon.label} key={icon.label}>
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
