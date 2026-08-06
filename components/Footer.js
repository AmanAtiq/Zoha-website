export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="/#hero" className="logo">
            <img className="logo-mark" src="/images/logo/logo-rose-bg.png" alt="" />
            <span className="logo-name">Zoha Asif</span>
          </a>
          <p>Raw, honest storytelling for silent souls.</p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><a href="/episodic-novels">Episodic Novels</a></li>
            <li><a href="/short-novels">Short Novels</a></li>
            <li><a href="/afsanay">Afsanay</a></li>
            <li><a href="/#about">About</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Connect</h4>
          <ul>
            <li><a href="/#socials">Socials</a></li>
            <li><a href="/#reviews">Reviews</a></li>
            <li><a href="mailto:hello@zohaasif.com">hello@zohaasif.com</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Zoha Asif. All rights reserved.</p>
          <a href="/#hero" className="back-to-top" aria-label="Back to top">↑</a>
        </div>
      </div>
    </footer>
  );
}
