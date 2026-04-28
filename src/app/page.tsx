import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import Index from "@/views/Index";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Jamming Room in Kathmandu, Nepal | Music Store | Music Jam Space",
  description:
    "Music Jam Space is a trusted jamming room and rehearsal studio in Kathmandu, Nepal, with full band setup and booking support. We also run a music store for guitars, drums, keyboards, microphones, and accessories.",
  keywords: [
    "jamming room in kathmandu",
    "jamming room in nepal",
    "jam room kathmandu",
    "band practice room kathmandu",
    "rehearsal studio kathmandu",
    "rehearsal room nepal",
    "music store",
    "music store in nepal",
    "music store nepal",
    "music store in kathmandu",
    "music store kathmandu",
    "best music store in kathmandu",
    "best music store in nepal",
    "top music store in kathmandu",
    "top music store in nepal",
    "online music store in nepal",
    "instrument store in nepal",
    "musical instrument store kathmandu",
    "guitar store in nepal",
    "drum store in nepal",
    "music shop in kathmandu",
    "music shop in nepal",
    "guitars in nepal",
    "drums in nepal",
    "drums in kathmandu",
    "drums price in nepal",
    "music jam space",
    "online music store nepal",
    "buy musical instruments nepal",
    "music instruments nepal",
    "band practice room kathmandu nepal",
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
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Jamming Room in Kathmandu, Nepal | Music Jam Space",
    description:
      "Jamming room and rehearsal studio in Kathmandu, Nepal, with full setup. Also shop instruments from our music store.",
    url: siteUrl,
    type: "website",
    images: [{ url: "/jamspace.jpg", width: 1200, height: 630, alt: "Music Jam Space studio" }],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["MusicStore", "LocalBusiness"],
  name: "Music Jam Space",
  description:
    "Music store in Kathmandu, Nepal for guitars, drums, keyboards, microphones, accessories, and rehearsal support.",
  url: siteUrl,
  telephone: "+9779860342125",
  image: `${siteUrl}/jamspace.jpg`,
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
