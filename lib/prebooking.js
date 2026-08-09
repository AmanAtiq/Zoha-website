export const EDITION_DETAILS = {
  "tu-sawera-mera": {
    price: 1850,
    note: "Seven-part collector edition",
    pitch: "A complete story to return to, with every chapter gathered into one keepsake volume.",
    points: ["Collector-ready first print", "Beautifully gathered complete edition", "Reserved before the press run"],
  },
  "chupa-humdum": {
    price: null,
    note: "Signed first print",
    pitch: "A tender, unforgettable story made for the shelf you reach for when you need quiet company.",
    points: ["Limited first print", "Giftable keepsake edition", "Packed carefully for delivery"],
  },
  "terey-aaney-sey": {
    price: 1450,
    note: "Signed first print",
    pitch: "Keep this soft, searching story close in an edition designed to be read and reread.",
    points: ["Limited first print", "Giftable keepsake edition", "Packed carefully for delivery"],
  },
  tadbeer: {
    price: 1250,
    note: "Limited first print",
    pitch: "A thoughtful physical edition for a story about the choices we make when life asks us to be brave.",
    points: ["Limited first print", "Thoughtful paper and finish", "Reserved before general release"],
  },
  "khawaja-sira": {
    price: 950,
    note: "Art-paper edition",
    pitch: "A powerful afsana that deserves a permanent place in your personal library.",
    points: ["Art-paper presentation", "Short, impactful read", "Packed carefully for delivery"],
  },
  muhafiz: {
    price: 950,
    note: "Art-paper edition",
    pitch: "Bring home a story of protection, tenderness, and the people who quietly become our shelter.",
    points: ["Art-paper presentation", "Short, impactful read", "Packed carefully for delivery"],
  },
};

export const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

export const addItemToBasket = (current, book) => {
  const existing = current.find((item) => item.slug === book.slug);
  if (existing) {
    return current.map((item) => (
      item.slug === book.slug ? { ...item, quantity: item.quantity + 1 } : item
    ));
  }
  return [...current, {
    slug: book.slug,
    title: book.title,
    price: EDITION_DETAILS[book.slug].price,
    quantity: 1,
  }];
};
