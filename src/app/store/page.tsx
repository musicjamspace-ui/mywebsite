import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { STORE_PRODUCTS } from "@/lib/storeProducts";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Nepal's #1 Music Store Online | Buy Instruments | Music Jam Space",
  description:
    "Music Jam Space is Nepal's #1 online music store — drum kits, guitars, bass, keyboards, studio mics & more. Trusted prices, quality-checked gear, pickup & local delivery from Kathmandu to musicians across Nepal.",
  keywords: [
    "#1 music store Nepal",
    "number 1 music store Nepal",
    "best music store Nepal",
    "top music shop Kathmandu",
    "online music store Nepal",
    "buy musical instruments Nepal",
    "music instruments Nepal",
    "music instrument store Kathmandu",
    "drum kit price Nepal",
    "drum price in Nepal",
    "buy drums Nepal",
    "professional drum kit Nepal",
    "electric guitar price Nepal",
    "acoustic guitar price Nepal",
    "bass guitar price Nepal",
    "buy guitar Nepal",
    "guitar in Nepal",
    "keyboard price in Nepal",
    "casio keyboard Nepal",
    "61 key keyboard Nepal",
    "buy keyboard Nepal",
    "studio condenser mic Nepal",
    "microphone price Nepal",
    "buy microphone Nepal",
    "music gear Nepal",
    "musical equipment Kathmandu",
    "instrument shop Kathmandu",
    "guitar pick price Nepal",
    "drum sticks Nepal",
    "music accessories Nepal",
  ],
  alternates: { canonical: `${BASE_URL}/store` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Nepal's #1 Music Store | Music Jam Space",
    description:
      "Nepal's #1 online music shop — drums, guitars, keyboards, mics. Trusted prices & delivery.",
    url: `${BASE_URL}/store`,
    type: "website",
    images: [{ url: "/jamspace.jpg", width: 1200, height: 630, alt: "Music Jam Space Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal's #1 Music Store | Music Jam Space",
    description: "Drums, guitars, keyboards, mics — Nepal's top online music shop.",
    images: ["/jamspace.jpg"],
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Nepal's #1 Music Store — Instruments at Music Jam Space",
  numberOfItems: STORE_PRODUCTS.length,
  itemListElement: STORE_PRODUCTS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${BASE_URL}/store/${p.id}`,
    name: p.name,
    item: {
      "@type": "Product",
      name: p.name,
      image: `${BASE_URL}${p.image}`,
      offers: { "@type": "Offer", priceCurrency: "NPR", price: p.price },
    },
  })),
};

export default function StorePage() {
  return (
    <div className="min-h-dvh bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <section className="pt-24 pb-20 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-4xl sm:text-6xl font-bold text-primary mb-4">Store</h1>
          <p className="text-sm sm:text-base text-primary/90 font-medium mb-2">
            Nepal&apos;s #1 online music store — trusted gear, fair prices, Kathmandu.
          </p>
          <p className="text-muted-foreground text-base sm:text-lg mb-12">
            Browse our full collection of instruments and gear.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORE_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/store/${product.id}`}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.name} — buy in Nepal at Music Jam Space`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-primary uppercase tracking-widest mb-2">{product.category}</p>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{product.name}</h3>
                  <p className="text-primary font-semibold">Rs. {product.price.toLocaleString("en-IN")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

