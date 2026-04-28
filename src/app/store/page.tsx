import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { fetchStoreProducts } from "@/lib/api";
import { isUploadImageUrl } from "@/lib/api";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Music Store in Nepal | Buy Instruments in Kathmandu | Music Jam Space",
  description:
    "Music Jam Space store offers guitars, drums, bass, keyboards, microphones, and accessories in Nepal. Trusted music store in Kathmandu with fair prices, pickup, and local delivery.",
  keywords: [
    "music store in nepal",
    "music store nepal",
    "music store in kathmandu",
    "music store kathmandu",
    "online music store nepal",
    "buy musical instruments nepal",
    "music instrument store kathmandu",
    "instrument shop kathmandu",
    "music shop nepal",
    "guitars in nepal",
    "drums in nepal",
    "drums in kathmandu",
    "drums price in nepal",
    "guitar price in nepal",
    "keyboard price in nepal",
    "microphone price nepal",
    "online music store Nepal",
    "buy musical instruments Nepal",
    "music instruments Nepal",
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
  alternates: { canonical: `${siteUrl}/store` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Music Store in Nepal | Music Jam Space Store",
    description:
      "Trusted music store in Kathmandu, Nepal for guitars, drums, keyboards, microphones and accessories.",
    url: `${siteUrl}/store`,
    type: "website",
    images: [{ url: "/jamspace.jpg", width: 1200, height: 630, alt: "Music Jam Space Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Music Store in Nepal | Music Jam Space",
    description: "Shop guitars, drums, keyboards and mics from our Kathmandu music store.",
    images: ["/jamspace.jpg"],
  },
};

export const revalidate = 60;

export default async function StorePage() {
  let products: Awaited<ReturnType<typeof fetchStoreProducts>> = [];
  try {
    products = await fetchStoreProducts({ next: { revalidate: 60 } });
  } catch {
    products = [];
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Music Store in Nepal — Instruments at Music Jam Space",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/store/${p.id}`,
      name: p.name,
      item: {
        "@type": "Product",
        name: p.name,
        image: `${siteUrl}${p.image}`,
        offers: { "@type": "Offer", priceCurrency: "NPR", price: p.price },
      },
    })),
  };

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

          <section className="mb-10 rounded-xl border border-border bg-card/60 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-primary mb-2">About MJS</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">Music Jam Space</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
              MJS is Kathmandu&apos;s trusted music hub for instruments, rehearsal, and custom drum
              builds. If you want to know more about MJS Custom Drums, visit the MJS section.
            </p>
            <div className="mt-5">
              <Link
                href="/mjs-drums"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Visit MJS
              </Link>
            </div>
          </section>

          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">
              No products are listed yet. Please check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
                    unoptimized={isUploadImageUrl(product.image)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
          )}
        </div>
      </section>
    </div>
  );
}
