export default function AuthorIntro() {
  return (
    <section className="section section--tint" id="about">
      <div className="container about-grid">
        {/* Placeholder — swap for a real author portrait when supplied (SOW 6.2) */}
        <img
          className="about-portrait"
          src="/images/logo/logo-maroon-bg.png"
          alt="Zoha Asif"
        />

        <div className="about-copy">
          <p className="eyebrow eyebrow--dark">The Author</p>
          <h2>
            Zoha Asif <span className="about-urdu" lang="ur" dir="rtl">زوہا آصف</span>
          </h2>
          <p className="about-mission-ur" lang="ur" dir="rtl">
            میں وہ جذبات لکھتی ہوں جو زبان تک نہیں پہنچ پاتے۔
          </p>
          <p className="about-mission">
            &ldquo;I will name the feelings you were never taught how to say.&rdquo;
          </p>
          <p className="about-poem" lang="ur" dir="rtl">
            کچھ کہانیاں کتابوں میں نہیں جیتی جاتیں، وہ سینوں میں دفن ہوتی ہیں، آنکھوں میں
            ٹھہری رہتی ہیں، اور رات کے اندھیرے میں خاموشی سے سانس لیتی ہیں۔ زوہا آصف انہی
            کہانیوں کو ڈھونڈتی ہیں۔ وہ صرف لکھتی نہیں ہیں بلکہ وہ محسوس کرتی ہیں، گہرائی
            میں اترتی ہیں اور پھر الفاظ کو اس طرح ترتیب دیتی ہیں کہ پڑھنے والا رک جائے اور
            سوچے، یہ تو میری ہی بات ہے۔
          </p>
          <p className="about-bio">
            A pharmacist by education, and a storyteller by the truest calling of her
            soul, Zoha Asif is an Urdu fiction author based in Lahore, Pakistan. Her
            writing is not simply fiction — it is emotional archaeology: a careful,
            tender excavation of the feelings people carry without names, the battles
            they fight without witnesses, and the healing they reach for without maps.
            Her work spans <em>Terey Aaney Sey</em>, <em>Tu Sawera Mera</em>,{" "}
            <em>Chupa Humdum</em>, and <em>Unkahe Jazbaat</em>.
          </p>
          <a href="/#socials" className="btn btn-outline-dark">
            Get in Touch
          </a>
          <span className="placeholder-flag" style={{ display: "block", width: "fit-content", marginTop: 16 }}>
            Portrait pending
          </span>
        </div>
      </div>
    </section>
  );
}
