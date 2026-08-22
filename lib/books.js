// Static content for the frontend-lock milestone.
// Shape mirrors the future `books` table so swapping this for a real
// data fetch (FastAPI) later is a like-for-like change, not a rewrite.

// PLACEHOLDER — every book/episode points at the same stand-in PDF until
// Zoha supplies the real soft copies; swap `pdf` per-book when they land.
const PLACEHOLDER_PDF = "/pdfs/coming-soon.pdf";

export const books = [
  {
    slug: "tu-sawera-mera",
    title: "Tu Sawera Mera",
    titleUrdu: "تو سویرا میرا",
    type: "episodic",
    comingSoon: true,
    typeLabel: "Episodic Novel",
    badge: "Seven-Part Series",
    cover: "/images/covers/tu-sawera-mera.png",
    hero: "/images/hero/hero-tu-sawera-mera.png",
    tagline:
      "Follow Hiba's journey through crisis, courage, and hidden truths within a complex household.",
    ctaLabel: "Read / Download PDF",
    pdf: PLACEHOLDER_PDF,

    description:
      "Some homes are quiet not because there is peace, but because no one was ever allowed to speak. Tu Sawera Mera follows a girl who learns to name what she was taught to swallow, and then has to decide what that naming will cost her. It is a story about the long distance between surviving a house and belonging to yourself, told slowly, without hurry, and without pretending that healing arrives on time.",
    genres: [
      "Literary fiction",
      "Family drama",
      "Emotional healing",
      "Faith and hope",
      "Women's strength",
      "Coming of age",
    ],
    authorNote:
      "I did not write this to make anyone feel better quickly. I wrote it because I kept meeting girls who could describe everything except what was happening to them, and I wanted to hand them the words. If you find yourself in a page here, you were not imagining it. Take your time with her. She takes her time too.",
    excerpt: {
      ur: "کچھ محبتیں کہی نہیں جاتیں — بس محسوس ہوتی ہیں۔",
      source: "From episode 06, The Silent Confession",
      episodeSlug: "episode-06",
    },
    forYou: [
      "You grew up being called sensitive for noticing everything",
      "Your house was peaceful only because everyone stayed quiet",
      "You apologise for feelings before you finish explaining them",
      "You are tired of being told to be grateful instead of heard",
    ],
    rating: { avg: 4.8, count: 1340, dist: [80, 14, 4, 1, 1] },
    reviews: [
      {
        name: "Hina",
        when: "3 days ago",
        rating: 5,
        text: "Episode 4 undid me. I have read that prayer scene four times and I still have to put the phone down halfway through.",
      },
      {
        name: "Areeba",
        when: "1 week ago",
        rating: 5,
        text: "I started this novel expecting a family story and found my own childhood in it. The mother is written so fairly that I could not even stay angry at her.",
      },
      {
        name: "Mahnoor",
        when: "2 weeks ago",
        rating: 4,
        text: "The pacing is slow in the middle episodes and I mean that as praise, though I did wish episode 7 had arrived sooner.",
      },
      {
        name: "Sadia",
        when: "3 weeks ago",
        rating: 5,
        text: "What I keep coming back for is the language. Nothing is exaggerated. She writes grief the way it actually behaves.",
      },
    ],
    quote: {
      ur: "ایک بزدل اور کمزور مرد کے سایے میں رہنے سے اچھا ہے میں خود اپنی ڈھال بنوں۔",
      en: "Better to become my own shield than live in the shadow of a weak, fearful man.",
      source: "TU SAWERA MERA · ZOHA ASIF",
    },

    // Real episode-wise teasers, as provided by Zoha — 7 released so far.
    moreEpisodesComing: true,
    episodes: [
      {
        slug: "episode-01",
        title: "The Meeting",
        urduTitle: "باب اول — ملاقات",
        teaserUr:
          "ایک سنسان سڑک۔ ایک ضدی لڑکی۔ اور ایک اجنبی کی گاڑی جس میں وہ بے خبر بیٹھ گئی۔",
        synopsis:
          "Hiba needs this job desperately. But the house she steps into is a world of its own. A commanding CEO, a mischievous gang of cousins, and a silent, paralysed mother who longs for just one companion.",
        closingLineUr: "باب اول : جہاں سب شروع ہوا۔",
        pdf: PLACEHOLDER_PDF,
      },
      {
        slug: "episode-02",
        title: "The Test",
        urduTitle: "باب دوم — آزمائش",
        teaserUr: "ہر نئی جگہ ایک امتحان ہوتی ہے۔ مگر کچھ امتحان دل توڑ دیتے ہیں۔",
        synopsis:
          "Pranks, taunts, and a sharp-tongued aunt at work. A looming threat at home. Hiba steadies herself through it all, but a new storm is already waiting at her doorstep.",
        closingLineUr: "باب دوم : جہاں ہر دن ایک نیا امتحان ہے۔",
        pdf: PLACEHOLDER_PDF,
      },
      {
        slug: "episode-03",
        title: "Courage",
        urduTitle: "باب سوم — حوصلہ",
        teaserUr: "جب اپنوں کی طبیعت بگڑے تب پتہ چلتا ہے کون اپنا ہے۔",
        synopsis:
          "When a sudden crisis grips the house at midnight, the man who is always so composed sits by his mother's side and prays. And Hiba faces a choice that will test everything she thought she knew.",
        closingLineUr: "باب سوم : جہاں حوصلہ ہی سب کچھ ہے۔",
        pdf: PLACEHOLDER_PDF,
      },
      {
        slug: "episode-04",
        title: "The Bitter Truth",
        urduTitle: "باب چہارم — تلخ حقیقت",
        teaserUr: "کبھی کبھی سب سے بڑی مدد وہ ہوتی ہے جو خاموشی سے کی جائے۔",
        synopsis:
          "As fresh hardship strikes Hiba's family, Talal quietly carries every burden, asking nothing in return. But one sentence he says leaves everyone shaken, hinting at a truth no one understands yet.",
        closingLineUr: "باب چہارم : جہاں ایک سچ سب کچھ بدل سکتا ہے۔",
        pdf: PLACEHOLDER_PDF,
      },
      {
        slug: "episode-05",
        title: "The Realization",
        urduTitle: "باب پنجم — ادراک",
        teaserUr:
          "ہر شخص کسی نہ کسی کا محافظ ہوتا ہے۔ سوال یہ ہے وہ وقت پر پہنچتا ہے یا نہیں؟",
        synopsis:
          "Talal reveals a secret that holds his whole family together. And that same night, the one man Fauzia feared most forces his way into their home — with Hiba and her mother in danger, and Tahir helpless to stop it.",
        closingLineUr: "باب پنجم : جہاں ہر کسی کو اپنا محافظ بننا پڑتا ہے۔",
        pdf: PLACEHOLDER_PDF,
      },
      {
        slug: "episode-06",
        title: "The Silent Confession",
        urduTitle: "باب ششم — خاموش اعتراف",
        teaserUr: "کچھ محبتیں کہی نہیں جاتیں — بس محسوس ہوتی ہیں۔",
        synopsis:
          "The same rain. The same crossing. And the same man who once appeared like a guardian. Talal wants to say something but the words stop at his lips. \"You are special… very special.\"",
        closingLineUr: "باب ششم : جہاں محبت خاموشی میں چھپی ہے۔",
        pdf: PLACEHOLDER_PDF,
      },
      {
        slug: "episode-07",
        title: "Fragile Threads",
        urduTitle: "باب ہفتم — کچے دھاگے",
        teaserUr:
          "کچھ رشتے ریشم کے ہوتے ہیں۔ اور کچھ کچے دھاگوں کے، جو ذرا سے کھنچاؤ پر ٹوٹ جاتے ہیں۔",
        synopsis:
          "Anum is weaving a dangerous plot to drive Hiba out, using her own family as pawns. A blackmailer trails her every move. And Farwa, lost in love, stands at a turning point that could become a lifelong regret.",
        closingLineUr: "باب ہفتم : جہاں کچے دھاگے ٹوٹنے کو ہیں۔",
        pdf: PLACEHOLDER_PDF,
      },
    ],
  },
  {
    comingSoon: true,
    slug: "chupa-humdum",
    title: "Chupa Humdum",
    titleUrdu: "چھپا ہمدم",
    type: "short-novel",
    typeLabel: "Short Novel",
    badge: "Complete",
    cover: "/images/covers/chupa-humdum.png",
    hero: "/images/hero/hero-chupa-humdum.png",
    tagline:
      "A tender love story exploring unspoken feelings and hidden support systems within relationships.",
    ctaLabel: "Read / Download PDF",
    pdf: PLACEHOLDER_PDF,

    descriptionUr:
      "ہر انسان کو ایک سچے ہمدم کی تلاش ہوتی ہے۔ مگر کیا ہم اُسے پہچان پاتے ہیں جو ہمیشہ خفیہ مددگار ثابت ہوتا ہے؟",
    description:
      "Chupa Humdum is a tender love story full of laughter, teasing, and unspoken feelings — but beneath it runs a quieter truth: behind every heart that finds its way home, there is an unseen hand we so often forget to thank. A gentle reminder to hold on to gratitude for the blessings that quietly hold our lives together.",
    genres: ["Contemporary romance", "Slow burn", "Family expectations", "Healing"],
    forYou: [
      "You've loved someone quietly before either of you had a name for it",
      "You believe support can be its own love language",
      "You want a romance that earns its ending slowly",
      "You like stories where nothing is rushed",
    ],
  },
  {
    slug: "terey-aaney-sey",
    title: "Terey Aaney Sey",
    titleUrdu: "تیرے آنے سے",
    type: "short-novel",
    typeLabel: "Short Novel",
    badge: "Complete",
    cover: "/images/covers/terey-aaney-sey.png",
    hero: "/images/hero/hero-terey-aaney-sey.png",
    tagline:
      "A warm romance about arranged marriage, misunderstanding, and love that grows quietly over time.",
    ctaLabel: "Read / Download PDF",
    pdf: PLACEHOLDER_PDF,

    descriptionUr:
      "کبھی کبھی محبت پہلے نہیں ہوتی — پہلے رشتہ بنتا ہے، پھر دل ملتے ہیں۔",
    description:
      "Tere Aanay Se is a warm, heartfelt love story about a marriage one of them refused to accept — and the quiet, patient love that slowly grew to fill it. Full of teasing, misunderstanding, and pride, it gently reminds us that sometimes love settles into the heart slowly, without ever telling us.",
    genres: ["Arranged marriage", "Contemporary romance", "Family drama", "Slow burn"],
    forYou: [
      "You think arranged doesn't have to mean loveless",
      "You've mistaken someone's quiet for disinterest",
      "You want a marriage story that isn't rushed into romance",
      "You like watching trust get built, not assumed",
    ],
  },
  {
    slug: "tadbeer",
    title: "Tadbeer",
    titleUrdu: "تدبیر",
    type: "short-novel",
    typeLabel: "Short Novel",
    badge: "New",
    cover: "/images/covers/tadbeer.png",
    hero: "/images/hero/hero-tadbeer.png",
    tagline:
      "A twelve-year-old boy chooses courage over fear in the darkest moment of his life.",
    ctaLabel: "Read / Download PDF",
    pdf: PLACEHOLDER_PDF,

    descriptionUr: "ڈر اُسے بھی لگا تھا مگر اُس نے ہار نہیں مانی تھی۔",
    description:
      "Tadbeer is the story of a twelve-year-old boy who refuses to surrender to fear. Trapped in the darkest moment of his life, he chooses courage, presence of mind, and quiet faith over panic — and it changes everything. A gripping reminder that effort is ours to make, and the outcome rests with the One who plans best.",
    genres: ["Courage & resilience", "Faith", "Coming of age", "Short fiction"],
    quote: {
      ur: "تدبیر بندے کے ہاتھ میں ہے اور نتیجہ اُس کے، جو بہترین کارساز ہے۔",
      en: "Effort is man's to make; the outcome belongs to Him, the best of planners.",
      source: "TADBEER · ZOHA ASIF",
    },
  },
  {
    slug: "khawaja-sira",
    title: "Khawaja Sira",
    titleUrdu: "خواجہ سرا",
    type: "afsana",
    typeLabel: "Afsana",
    badge: "Afsana",
    cover: "/images/covers/khawaja-sira.jpg",
    hero: "/images/hero/hero-khawaja-sira.png",
    tagline:
      "Some people are born into worlds with no room for them — not because they are wrong, simply because they are different.",
    ctaLabel: "Read / Download PDF",
    pdf: PLACEHOLDER_PDF,

    descriptionUr:
      "حماد ذوالفقار نے ساری زندگی ایک ہی سوال جھیلا — کیا مختلف ہونا واقعی اتنا بڑا جرم ہے؟",
    description:
      "Khawaja Sira is the story of a person who lost everything that should have been theirs by right — a home, a family, a name — cast out not for any wrongdoing, but for simply existing as they are. Yet what remains is not bitterness. What remains is something far more powerful: dignity. It is a story about what it means to love people who have hurt you, to forgive without forgetting, and to stand tall in front of a world that tried to make you small.",
    genres: ["Afsana", "Social realism", "Dignity", "Compassion", "Literary fiction"],
    authorNote:
      "I wrote this after an afternoon I could not stop thinking about. I am not claiming to speak for anyone. I only wanted to write one person the way they deserved to be written, which is carefully, and without turning them into a lesson.",
    excerpt: {
      ur: "جو مختلف تھے، وہ غلط نہیں تھے۔ بس ان کے لیے کوئی جگہ بنائی ہی نہیں گئی تھی۔",
      source: "From the closing scene",
    },
    readingTips: [
      { label: "22 minutes", detail: "Written to be read in one sitting" },
      { label: "Best read late", detail: "It does not sit well in a hurry" },
      { label: "Complete", detail: "Nothing serialised, nothing withheld" },
    ],
    forYou: [
      "You have looked away from someone and thought about it later",
      "You believe dignity should not depend on being understood",
      "You want a story that argues nothing and still changes something",
      "You have twenty minutes and want them to matter",
    ],
    rating: { avg: 4.9, count: 407, dist: [84, 11, 3, 1, 1] },
    reviews: [
      {
        name: "Iqra",
        when: "4 days ago",
        rating: 5,
        text: "I have never read this subject handled without pity. Twenty minutes and I have been quiet since.",
      },
      {
        name: "Fatima",
        when: "1 week ago",
        rating: 5,
        text: "The last line does the whole work. I sent this to four people before I finished processing it.",
      },
      {
        name: "Noor",
        when: "3 weeks ago",
        rating: 5,
        text: "What I appreciated most is that she never explains the character to us. She just lets them exist on the page.",
      },
    ],
    quote: {
      ur: "جس دن آپ کی سوچ ترقی کرنے لگے گی نا اس دن یہ ملک ترقی کرنے لگے گا۔",
      en: "The day your thinking begins to progress, that is the day this country begins to progress.",
      source: "KHAWAJA SIRA · ZOHA ASIF",
    },
  },
  {
    slug: "muhafiz",
    title: "Muhafiz",
    titleUrdu: "محافظ",
    type: "afsana",
    typeLabel: "Afsana",
    badge: "Afsana",
    cover: "/images/covers/muhafiz.png",
    hero: "/images/hero/hero-muhafiz.png",
    tagline:
      "A gripping tribute to silent guardians — we sleep peacefully because someone stays awake.",
    ctaLabel: "Read / Download PDF",
    pdf: PLACEHOLDER_PDF,

    descriptionUr: "ہم سکون سے سوتے ہیں کیونکہ کوئی جاگ رہا ہوتا ہے۔",
    description:
      "Muhafiz is a short, gripping story about the silent guardians who stand between us and the dark — and the price they pay so the rest of us can sleep in peace. A tribute to the ones who never come home, told with honesty and heart.",
    genres: ["Afsana", "Tribute", "Social realism", "Quiet strength"],
    readingTips: [
      { label: "One sitting", detail: "Short enough to read in a single afternoon" },
      { label: "Best read slowly", detail: "It does not sit well in a hurry" },
      { label: "Complete", detail: "Nothing serialised, nothing withheld" },
    ],
    forYou: [
      "You've been the one who stays up so others can sleep",
      "You notice the people whose care usually goes unnoticed",
      "You want a short story you can sit with in one sitting",
      "You believe quiet devotion deserves its own spotlight",
    ],
    quote: {
      ur: "ہم امن کے محافظ ہیں اور امن قائم کیے رکھنا ہی ہمارا فرض اول ہے، ہم اس لیے صبح کے اجالے سے لے کر رات کی تاریکی تک کام میں لگے ہوتے ہیں تاکہ ہماری قوم سکون سے رہے۔",
      en: "We are the guardians of peace, and keeping peace is our first duty — so from the light of morning to the dark of night, we stay at work, so our people can rest easy.",
      source: "MUHAFIZ · ZOHA ASIF",
    },
  },
];

export const getBySlug = (slug) => books.find((b) => b.slug === slug);
export const byType = (type) => books.filter((b) => b.type === type);

export const getEpisode = (book, episodeSlug) =>
  book?.episodes?.find((e) => e.slug === episodeSlug);

export const moreFrom = (book, count = 4) =>
  books.filter((b) => b.slug !== book.slug).slice(0, count);

// Hero slider pulls the strongest cross-section, not necessarily every title
export const heroSlides = books.filter((b) =>
  ["tu-sawera-mera", "chupa-humdum", "terey-aaney-sey", "khawaja-sira"].includes(b.slug)
);

export const testimonials = [
  {
    quote:
      "Tu Sawera Mera found me at the exact moment I needed it. Every part of Hiba's story feels like it was written for me specifically.",
    source: "Reader, Instagram",
  },
  {
    quote:
      "Chupa Humdum is the kind of story that stays with you long after the last page. Honest, tender, and so necessary.",
    source: "Reader, Goodreads",
  },
  {
    quote:
      "Khawaja Sira broke my heart open. I've never seen that kind of belonging and rejection written with so much care.",
    source: "Reader, Facebook",
  },
];

export const faqs = [
  {
    q: "Are the soft copies really free?",
    a: "Yes. Every episodic novel, short novel and afsana on this site can be read or downloaded as a PDF at no cost.",
  },
  {
    q: "How do I get a hard copy?",
    a: "Open any book's page and choose the hard copy option. You'll add it to your cart, check out with your delivery details, and place the order directly on the site — the same as any online store.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery timelines and charges vary by location — they're shown at checkout before you confirm your order.",
  },
  {
    q: "Can I read on my phone?",
    a: "Yes — the PDF viewer and downloaded PDFs both work on phone, tablet, or laptop.",
  },
  {
    q: "Do you offer refunds or exchanges?",
    a: "If a hard copy arrives damaged or incorrect, reach out through the contact details in the footer and it'll be sorted out.",
  },
];
