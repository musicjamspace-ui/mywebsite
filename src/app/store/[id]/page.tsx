import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Truck, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { productGalleryImages } from "@/lib/storeProducts";
import { fetchStoreProductById, fetchStoreProducts } from "@/lib/api";
import StoreBuyNowForm from "@/components/StoreBuyNowForm";
import StoreProductGallery from "@/components/StoreProductGallery";
import { getSiteUrl } from "@/lib/siteUrl";

type PageProps = {
  params: Promise<{ id: string }>;
};

const siteUrl = getSiteUrl();

export const revalidate = 60;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Guitars: [
    "guitar price in Nepal",
    "buy guitar Nepal",
    "electric guitar Nepal",
    "acoustic guitar Nepal",
    "bass guitar Nepal",
    "guitar shop Kathmandu",
    "best guitar in Nepal",
    "cheap guitar Nepal",
    "guitar for beginners Nepal",
    "fender guitar Nepal",
    "yamaha guitar Nepal",
  ],
  Drums: [
    "drum price in Nepal",
    "buy drums Nepal",
    "drum kit Nepal",
    "professional drum kit Nepal",
    "drum set price Nepal",
    "drum sticks Nepal",
    "snare drum Nepal",
    "drum cymbals Nepal",
    "tama drums Nepal",
    "pearl drums Nepal",
    "best drum kit Nepal",
  ],
  Keyboards: [
    "keyboard price in Nepal",
    "buy keyboard Nepal",
    "casio keyboard Nepal",
    "yamaha keyboard Nepal",
    "61 key keyboard Nepal",
    "piano keyboard Nepal",
    "digital piano Nepal",
    "synthesizer Nepal",
    "keyboard for beginners Nepal",
    "musical keyboard price Nepal",
  ],
  Microphones: [
    "microphone price Nepal",
    "buy microphone Nepal",
    "condenser mic Nepal",
    "studio microphone Nepal",
    "XLR microphone Nepal",
    "recording microphone Nepal",
    "vocal microphone Nepal",
    "best mic for recording Nepal",
    "dynamic microphone Nepal",
    "wireless microphone Nepal",
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let product = null;
  try {
    product = await fetchStoreProductById(id, { next: { revalidate: 60 } });
  } catch {
    product = null;
  }
  if (!product) {
    return {
      title: "Product Not Found | Music Jam Space",
      robots: { index: false, follow: false },
    };
  }

  const productUrl = `${siteUrl}/store/${product.id}`;
  const nameLower = product.name.toLowerCase();
  const catLower = product.category.toLowerCase();

  const priceStr = product.price.toLocaleString("en-IN");
  const keywords = [
    "#1 music store Nepal",
    "number 1 music store Nepal",
    "no 1 music store Nepal",
    "best music store Nepal",
    "top online music store Nepal",
    "Nepal music shop online",
    `${product.name} in Nepal`,
    `${product.name} price in Nepal`,
    `buy ${product.name} Nepal`,
    `${product.name} price`,
    `${product.name} Kathmandu`,
    `best ${nameLower} Nepal`,
    `cheap ${nameLower} Nepal`,
    `${catLower} in Nepal`,
    `${catLower} price in Nepal`,
    `buy ${catLower} Nepal`,
    `${catLower} shop Kathmandu`,
    ...(CATEGORY_KEYWORDS[product.category] ?? []),
    "musical instruments Nepal",
    "music store Kathmandu",
    "music gear Nepal",
    "instrument shop Nepal",
    "music jam space store",
  ];

  const descText = `Shop ${product.name} at Music Jam Space — Nepal's #1 online music store & instrument shop in Kathmandu. Rs. ${priceStr}. ${product.description.slice(0, 110).trim()}… Official prices, pickup & local delivery across Nepal.`;

  return {
    title: {
      absolute: `${product.name} · Rs. ${priceStr} | Nepal's #1 Music Store | Music Jam Space`,
    },
    description: descText,
    keywords,
    alternates: { canonical: productUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${product.name} | Nepal's #1 Music Store | Rs. ${priceStr}`,
      description: `Buy ${product.name} from Music Jam Space — Nepal's #1 music store. Rs. ${priceStr}. ${catLower} in Nepal with trusted service.`,
      url: productUrl,
      type: "website",
      siteName: "Music Jam Space — Nepal's #1 Music Store",
      images: [{ url: product.image, width: 800, height: 600, alt: `${product.name} — Nepal #1 music store, Music Jam Space` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | #1 Music Store Nepal`,
      description: `Rs. ${priceStr} · Music Jam Space — Nepal's top online music shop.`,
      images: [product.image],
    },
  };
}

export default async function StoreProductPage({ params }: PageProps) {
  const { id } = await params;
  let product = null;
  try {
    product = await fetchStoreProductById(id, { next: { revalidate: 60 } });
  } catch {
    product = null;
  }
  if (!product) notFound();

  let allProducts: Awaited<ReturnType<typeof fetchStoreProducts>> = [];
  try {
    allProducts = await fetchStoreProducts({ next: { revalidate: 60 } });
  } catch {
    allProducts = [];
  }
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 3);
  const combinedHighlights = [
    ...product.highlights,
    ...product.specs.map((s) => `${s.label}: ${s.value}`),
  ];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: productGalleryImages(product).map((img) => `${siteUrl}${img}`),
    description: product.description,
    brand: { "@type": "Brand", name: "Music Jam Space" },
    sku: product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/store/${product.id}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Music Jam Space",
        url: siteUrl,
        description:
          "Nepal's leading online music store and rehearsal studio — instruments, gear, and booking in Kathmandu.",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "NP",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 3, unitCode: "DAY" },
        },
      },
    },
    additionalProperty: product.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Store", item: `${siteUrl}/store` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteUrl}/store/${product.id}` },
    ],
  };

  return (
    <div className="min-h-dvh bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="pt-24 pb-20 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-10 xl:gap-x-14 gap-y-10 items-start">
            {/* Left: image + descriptive content */}
            <div className="space-y-6 min-w-0 max-lg:order-2 lg:order-none">
              <StoreProductGallery images={productGalleryImages(product)} alt={product.name} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
                  Quality checked
                </div>
                <div className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0 text-primary" />
                  Pickup / local delivery
                </div>
                <div className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground flex items-center gap-2 sm:col-span-1">
                  <Wrench className="w-4 h-4 shrink-0 text-primary" />
                  Setup help available
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-lg font-semibold text-foreground mb-2">Highlights</h2>
                <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                  {combinedHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: title, price, form */}
            <div className="space-y-6 min-w-0 max-lg:order-1 lg:order-none">
              <p className="text-sm text-primary uppercase tracking-widest">{product.category}</p>
              <p className="text-xs sm:text-sm text-muted-foreground -mt-3">
                Music Jam Space — Nepal&apos;s #1 online music store for instruments &amp; gear.
              </p>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-foreground leading-tight">{product.name}</h1>
              <p className="text-primary text-2xl sm:text-3xl font-semibold">
                Rs. {product.price.toLocaleString("en-IN")}
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">{product.description}</p>

              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-lg font-semibold text-foreground mb-2">Best For</h2>
                <div className="flex flex-wrap gap-2">
                  {product.bestFor.map((item) => (
                    <span key={item} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <StoreBuyNowForm productName={product.name} productPrice={product.price} />
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-semibold text-foreground mb-5">You may also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/store/${item.id}`}
                    className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-all"
                  >
                    <div className="relative h-44">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-primary uppercase tracking-widest">{item.category}</p>
                      <h3 className="text-lg font-semibold text-foreground mt-1">{item.name}</h3>
                      <p className="text-primary mt-1">Rs. {item.price.toLocaleString("en-IN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
