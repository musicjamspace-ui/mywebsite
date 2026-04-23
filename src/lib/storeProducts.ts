/** Product shape shared by admin, store UI, and API (`/api/products`). */
export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  /** Cover image for store listing cards */
  image: string;
  /** Optional extra photos on the product page (2–3+). Falls back to `[image]` if omitted. */
  images?: string[];
  category: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  bestFor: string[];
}

/** All gallery URLs for a product (detail page). */
export function productGalleryImages(p: StoreProduct): string[] {
  if (p.images?.length) return p.images;
  return [p.image];
}

/** Default seed data (mirrored in `server/src/seedStoreProducts.mjs`). Public pages load from the API. */
export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "electric-guitar",
    name: "Electric Guitar",
    price: 12500,
    image: "/jamspace.jpg",
    images: ["/jamspace.jpg", "/hero-studio.jpg", "/jamspace.jpg"],
    category: "Guitars",
    description:
      "High-quality electric guitar with smooth fretboard and versatile tone. Great for rock, blues, and live performance setups.",
    highlights: [
      "Comfortable neck profile for long rehearsal sessions",
      "Versatile tone suitable for clean and overdrive sounds",
      "Solid body build with stable tuning response",
    ],
    specs: [
      { label: "Body Type", value: "Solid Body" },
      { label: "Strings", value: "6" },
      { label: "Pickup Style", value: "Dual pickup setup" },
      { label: "Condition", value: "New / Store demo available" },
    ],
    bestFor: ["Band rehearsal", "Stage performance", "Home practice"],
  },
  {
    id: "drum-kit",
    name: "Professional Drum Kit",
    price: 28000,
    image: "/hero-studio.jpg",
    images: ["/hero-studio.jpg", "/jamspace.jpg"],
    category: "Drums",
    description:
      "Complete 5-piece drum kit with cymbals and hardware. Built for rehearsal rooms, recording practice, and stage use.",
    highlights: [
      "Balanced sound across kick, snare, and toms",
      "Includes core hardware for quick setup",
      "Reliable shell construction for daily use",
    ],
    specs: [
      { label: "Pieces", value: "5-piece" },
      { label: "Included", value: "Kick, snare, toms, cymbal set, hardware" },
      { label: "Use Case", value: "Practice / live events" },
      { label: "Condition", value: "New / Setup guidance available" },
    ],
    bestFor: ["Studio rehearsal", "Live performance", "Music schools"],
  },
  {
    id: "studio-microphone",
    name: "Studio Condenser Mic",
    price: 4500,
    image: "/hero-studio.jpg",
    images: ["/hero-studio.jpg", "/jamspace.jpg", "/hero-studio.jpg"],
    category: "Microphones",
    description:
      "Large-diaphragm condenser microphone ideal for vocals and acoustic instruments with clear response and low self-noise.",
    highlights: [
      "Clear vocal capture with detailed high frequencies",
      "Suitable for acoustic guitar and spoken voice",
      "Good sensitivity for home and studio setups",
    ],
    specs: [
      { label: "Type", value: "Condenser" },
      { label: "Polar Pattern", value: "Cardioid" },
      { label: "Connection", value: "Standard XLR" },
      { label: "Best Use", value: "Vocal / acoustic recording" },
    ],
    bestFor: ["Singers", "Podcasters", "Small recording setups"],
  },
  {
    id: "acoustic-guitar",
    name: "Acoustic Guitar",
    price: 8500,
    image: "/jamspace.jpg",
    category: "Guitars",
    description:
      "Full-size acoustic guitar with warm balanced sound, suitable for practice, recording demos, and unplugged performances.",
    highlights: [
      "Warm natural tone for unplugged sessions",
      "Comfortable action for beginners and regular players",
      "Durable body for frequent transport and use",
    ],
    specs: [
      { label: "Size", value: "Full-size" },
      { label: "Strings", value: "6" },
      { label: "Sound Character", value: "Warm and balanced" },
      { label: "Condition", value: "New" },
    ],
    bestFor: ["Beginner to intermediate players", "Acoustic sessions", "Songwriting"],
  },
  {
    id: "bass-guitar",
    name: "Bass Guitar",
    price: 11000,
    image: "/jamspace.jpg",
    category: "Guitars",
    description:
      "4-string electric bass guitar with punchy low-end and comfortable neck profile, perfect for rehearsal and stage bands.",
    highlights: [
      "Punchy low-end for full band mixes",
      "Smooth neck feel for easy movement",
      "Stable output for rehearsal and stage amplifiers",
    ],
    specs: [
      { label: "Strings", value: "4" },
      { label: "Body Type", value: "Electric bass body" },
      { label: "Tone", value: "Deep, punchy low-end" },
      { label: "Condition", value: "New / Test playable" },
    ],
    bestFor: ["Band rhythm sections", "Live sets", "Practice rooms"],
  },
  {
    id: "keyboard-61",
    name: "61-Key Keyboard",
    price: 15000,
    image: "/hero-studio.jpg",
    category: "Keyboards",
    description:
      "61-key keyboard with multiple tones and rhythm presets, ideal for beginners and intermediate musicians.",
    highlights: [
      "Multiple tones and rhythms for creative practice",
      "Responsive keys for better playing control",
      "Compact size for home and studio corners",
    ],
    specs: [
      { label: "Keys", value: "61" },
      { label: "Functions", value: "Tone and rhythm presets" },
      { label: "Level", value: "Beginner to intermediate" },
      { label: "Condition", value: "New" },
    ],
    bestFor: ["Learning", "Composing", "Band rehearsal support"],
  },
];

