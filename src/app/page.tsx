import type { Metadata } from "next";
import Index from "@/views/Index";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Music Jam Space | Nepal's #1 Music Store & Rehearsal Studio, Kathmandu",
  description:
    "Music Jam Space — Nepal's #1 online music store and rehearsal studio in Bhottebahal, Sundhara, Kathmandu. Buy drums, guitars, keyboards & mics at trusted prices; book AC rehearsal rooms and live sound for events.",
  keywords: [
    "music jam space",
    "#1 music store Nepal",
    "best music store Kathmandu",
    "top music shop Nepal",
    "online music store Nepal",
    "rehearsal studio Kathmandu",
    "rehearsal room Nepal",
    "band practice room Kathmandu Nepal",
    "jam room Kathmandu",
    "music studio Bhottebahal",
    "live sound services Nepal",
    "recording studio Kathmandu",
    "book rehearsal room Nepal",
    "musical instruments shop Kathmandu",
    "buy drums Nepal",
    "buy guitar Nepal",
    "buy keyboard Nepal",
    "drum kit price Nepal",
    "guitar price Nepal",
    "keyboard price Nepal",
    "bass guitar Nepal",
    "microphone Nepal",
    "studio condenser mic Nepal",
    "sound system rental Nepal",
    "live band entertainment Nepal",
    "music events Kathmandu",
  ],
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Music Jam Space | Nepal's #1 Music Store & Rehearsal Studio",
    description:
      "Nepal's #1 music store & rehearsal hub in Kathmandu. Book rooms, buy instruments, live sound.",
    url: BASE_URL,
    type: "website",
    images: [{ url: "/jamspace.jpg", width: 1200, height: 630, alt: "Music Jam Space studio" }],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicVenue",
  name: "Music Jam Space",
  description:
    "Nepal's #1 online music store and fully equipped air-conditioned rehearsal studio in Kathmandu — instruments, gear, room booking & live sound.",
  url: BASE_URL,
  telephone: "+9779860342125",
  image: `${BASE_URL}/jamspace.jpg`,
  priceRange: "Rs. 350 – Rs. 500 / hr",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bhottebahal, Sundhara",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati",
    addressCountry: "NP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 27.7,
    longitude: 85.31,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "06:00",
    closes: "21:00",
  },
  sameAs: [],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Band Practice Room" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Recording Studio" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Live Sound Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Musical Instrument Sales" } },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Index />
    </>
  );
}
