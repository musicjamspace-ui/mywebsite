import type { Metadata } from "next";
import BookClient from "@/views/BookClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Book a Rehearsal Room in Kathmandu | Music Jam Space",
  description:
    "Book rehearsal rooms at Music Jam Space, Kathmandu, Nepal. Check real-time availability, pick your time slot (6 AM – 9 PM), and confirm your rehearsal session online. AC rooms from Rs. 350/hr.",
  keywords: [
    "book rehearsal room Kathmandu",
    "book rehearsal room Nepal",
    "music practice room booking",
    "jam room booking Kathmandu",
    "band practice room Kathmandu",
    "rehearsal studio online booking Nepal",
    "music room availability Kathmandu",
    "hourly music room Nepal",
    "rehearsal room price Nepal",
    "music studio booking online",
  ],
  alternates: { canonical: `${BASE_URL}/book` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Book a Rehearsal Room in Kathmandu | Music Jam Space",
    description:
      "Check real-time room availability and book your rehearsal session at Music Jam Space, Kathmandu. AC rooms from Rs. 350/hr.",
    url: `${BASE_URL}/book`,
    type: "website",
    images: [{ url: "/jamspace.jpg", width: 1200, height: 630, alt: "Music Jam Space booking" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Rehearsal Room in Kathmandu",
    description: "AC rehearsal rooms from Rs. 350/hr. Book online at Music Jam Space.",
    images: ["/jamspace.jpg"],
  },
};

const bookingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Rehearsal Room Booking",
  provider: {
    "@type": "MusicVenue",
    name: "Music Jam Space",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bhottebahal, Sundhara",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
  },
  description:
    "Book fully equipped air-conditioned rehearsal rooms in Kathmandu, Nepal. Available daily from 6 AM to 9 PM.",
  areaServed: { "@type": "City", name: "Kathmandu" },
  offers: [
    {
      "@type": "Offer",
      name: "Room 1 (Big Room)",
      priceCurrency: "NPR",
      price: 500,
      unitText: "per hour",
    },
    {
      "@type": "Offer",
      name: "Room 2 (Small Room)",
      priceCurrency: "NPR",
      price: 350,
      unitText: "per hour",
    },
  ],
};

export default function BookPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookingJsonLd) }}
      />
      <BookClient />
    </>
  );
}
