import type { Metadata } from "next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/siteUrl";
import {
  MapPin,
  Music2,
  Phone,
  Sparkles,
  Wrench,
} from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MJS Custom Drums | Drums in Nepal & Kathmandu | Music Jam Space",
  description:
    "MJS Custom Drums by Music Jam Space - drums in Nepal and Kathmandu, custom drums in Nepal, budget drums, drum setup for band practice, and trusted drum prices in Nepal.",
  keywords: [
    "drums in nepal",
    "drums in kathmandu",
    "custom drums in nepal",
    "custom drums in kathmandu",
    "budget drums",
    "drums price in nepal",
    "music jam space",
    "music store nepal",
    "band practice",
    "drum kit nepal",
    "buy drums nepal",
    "acoustic drums nepal",
    "custom drum build nepal",
    "drum shop kathmandu",
    "best drums in nepal",
    "mjs custom drums",
  ],
  alternates: { canonical: `${siteUrl}/mjs-drums` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "MJS Custom Drums | Drums in Nepal & Kathmandu",
    description:
      "Custom drums in Nepal by Music Jam Space. Explore budget drums, drum specs, and trusted drum prices in Kathmandu.",
    url: `${siteUrl}/mjs-drums`,
    type: "website",
    siteName: "Music Jam Space",
    images: [{ url: "/mjs-drums/mjs-hero.jpg", width: 1200, height: 630, alt: "MJS Custom Drums" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MJS Custom Drums | Drums in Nepal",
    description: "Drums in Kathmandu, custom drums in Nepal, and budget drum options by Music Jam Space.",
    images: ["/mjs-drums/mjs-hero.jpg"],
  },
};

const kitStats = [
  { k: "Shells", v: "Poplar & Birch" },
  { k: "Remo UC", v: "Heavy-hitter heads" },
  { k: "2x braced", v: "Pro hardware" },
  { k: "Stage-ready", v: "Built to perform" },
];

const galleryTiles = [
  { img: "/mjs-drums/mjs-classic-kit.jpg", label: "Classic - Wood Grain Blast", span: "md:col-span-2 md:row-span-2" },
  { img: "/mjs-drums/mjs-snare.jpg", label: 'Snare - 14 x 5.5"' },
  { img: "/mjs-drums/mjs-shell-detail.jpg", label: "Shell detail" },
  { img: "/mjs-drums/mjs-modern-kit.jpg", label: "Modern - Black Blue Flash", span: "md:col-span-2" },
  { img: "/mjs-drums/mjs-bass.jpg", label: 'Bass - 22 x 18"' },
  { img: "/mjs-drums/mjs-hardware.jpg", label: "Double-braced legs" },
  { img: "/mjs-drums/mjs-sticks.jpg", label: "Drum key + sticks" },
];

export default function MjsDrumsPage() {
  const mjsJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "MJS Custom Drums",
    url: `${siteUrl}/mjs-drums`,
    description:
      "MJS Custom Drums by Music Jam Space featuring drums in Nepal, drums in Kathmandu, custom drum options, and budget-friendly drum setups.",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "Music Jam Space",
      url: siteUrl,
      areaServed: ["Nepal", "Kathmandu"],
      telephone: "+9779860342125",
      knowsAbout: [
        "drums in nepal",
        "drums in kathmandu",
        "custom drums in nepal",
        "custom drums in kathmandu",
        "budget drums",
        "drums price in nepal",
        "band practice",
        "music store nepal",
      ],
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mjsJsonLd) }}
      />
      <Hero />
      <FinishToggle />
      <Anatomy />
      <Hardware />
      <Gallery />
      <Contact />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <Image
        src="/mjs-drums/mjs-hero.jpg"
        alt="Drummer playing MJS custom drum kit under stage spotlight"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-24 md:pb-44 md:pt-36">
        <div className="pointer-events-none absolute right-4 top-6 md:right-8 md:top-[42%] md:-translate-y-1/2 lg:right-16">
          <Image
            src="/mjs-drums/logo.png"
            alt="MJS logo"
            width={372}
            height={352}
            priority
            className="h-auto w-14 opacity-90 sm:w-20 md:w-24 lg:w-32 xl:w-40"
          />
        </div>
        <Badge className="mb-6 max-w-[calc(100%-4rem)] border border-mjs-line bg-mjs-surface/60 text-[10px] font-mono-mjs uppercase tracking-[0.2em] text-mjs-muted sm:max-w-none">
          <Sparkles className="mr-1 h-3 w-3 text-mjs-amber" /> Custom built - Made to play
        </Badge>
        <h1 className="max-w-4xl pr-14 text-4xl font-light leading-[1.05] tracking-tight sm:pr-0 sm:text-5xl md:text-7xl lg:text-8xl">
          Built for feel.
          <br />
          <span className="text-mjs-amber">Designed for power.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-mjs-muted sm:mt-8 sm:text-lg md:text-xl">
          MJS Custom Drums hand-finished in two voices. Birch for bright attack. Poplar for warm
          resonance. Classic or Modern, your choice.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Button asChild size="lg" className="h-12 w-full bg-gradient-amber text-background shadow-glow-amber hover:opacity-90 sm:w-auto">
            <a href="#finishes">Explore the kits</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 w-full border-mjs-line bg-mjs-surface/60 hover:bg-mjs-surface-2 sm:w-auto">
            <a href="#contact">Book a demo</a>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 border-t border-mjs-line pt-6 sm:mt-20 sm:gap-6 sm:pt-8 md:grid-cols-4">
          {kitStats.map((item) => (
            <Stat key={item.k} k={item.k} v={item.v} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">{k}</div>
      <div className="mt-1 font-mono-mjs text-[11px] uppercase tracking-[0.18em] text-mjs-muted">
        {v}
      </div>
    </div>
  );
}

function FinishToggle() {
  return (
    <section id="finishes" className="border-t border-mjs-line py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono-mjs text-[11px] uppercase tracking-[0.22em] text-mjs-amber">
              Two voices - One craft
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
              Classic or Modern. Your choice.
            </h2>
          </div>
          <p className="max-w-md text-mjs-muted">
            Same skeleton. Different soul. Pick the shell that matches the music in your head.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-mjs-line bg-mjs-surface">
          <Image
            src="/mjs-drums/mjs-classic-kit.jpg"
            alt="Custom build drum kit"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background/90" />
          <div className="relative p-5 sm:p-8 md:p-12">
            <div className="font-mono-mjs text-[11px] uppercase tracking-[0.2em] text-mjs-muted">
              Poplar shell & Birch shell
            </div>
            <h3 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">Custom Build Drum Kit</h3>
            <p className="mt-3 text-base text-mjs-amber sm:text-lg">Classic or Modern. Your choice.</p>
            <p className="mt-5 max-w-3xl text-mjs-muted">
              Same skeleton. Different soul. Pick the shell that matches the music in your head.
              Each build is custom and can vary based on your sound.
            </p>

            <div className="mt-8 font-mono-mjs text-[11px] uppercase tracking-[0.2em] text-mjs-muted">
              Standard size
            </div>
            <div className="mt-8 grid gap-4 border-t border-mjs-line pt-6 text-sm md:grid-cols-2">
              <Spec label="Bass drum" value="22*18 inch" />
              <Spec label="Snare drum" value="14*5.5-inch matching wood snare" />
              <Spec label="Rack toms" value="10*7-inch and 12*8-inch" />
              <Spec label="Floor tom" value="16*16-inch floor tom" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
      <span className="font-mono-mjs text-[10px] uppercase tracking-[0.18em] text-mjs-muted">
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Anatomy() {
  return (
    <section className="py-16 sm:py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:gap-16 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <p className="font-mono-mjs text-[11px] uppercase tracking-[0.22em] text-mjs-amber">
            Shell anatomy
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">Every ply, deliberate.</h2>
          <p className="mt-6 max-w-lg text-mjs-muted">
            Poplar shell and Birch shell options, with precision-cut bearing edges and low-mass lugs
            that help the shell breathe and sustain naturally.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              ["Bearing edge", "Cut clean, sanded fine, sealed."],
              ["Low-mass lugs", "Less metal, more shell, longer sustain."],
              ["Triple-flange hoops", "Open, musical rim shots."],
              ["ISO mounts", "Chrome plated, memory-locked, sustain-friendly."],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-4 border-t border-mjs-line pt-5">
                <Wrench className="mt-1 h-4 w-4 shrink-0 text-mjs-amber" />
                <div>
                  <div className="font-medium">{k}</div>
                  <div className="text-sm text-mjs-muted">{v}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-2xl border border-mjs-line shadow-elegant">
            <Image
              src="/mjs-drums/mjs-shell-detail.jpg"
              alt="Macro detail of shell ply, bearing edge and chrome lug"
              width={1280}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Hardware() {
  return (
    <section id="hardware" className="border-t border-mjs-line bg-mjs-surface/40 py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 max-w-3xl">
          <p className="font-mono-mjs text-[11px] uppercase tracking-[0.22em] text-mjs-amber">
            Heavy-duty hardware
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">Double-braced. Stage-ready.</h2>
          <p className="mt-5 text-mjs-muted">
            Twin reinforced strips and welded construction keep stands stable even when the room gets loud.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <HardwareCard
            img="/mjs-drums/mjs-hardware.jpg"
            title="Double-braced stands"
            body="Cymbal (straight + boom), snare and hi-hat stands with twin steel legs for stability."
          />
          <HardwareCard
            img="/mjs-drums/mjs-bass.jpg"
            title={'22" bass drum + pedal'}
            body="Direct-drive single bass pedal with smooth chain mechanism and controlled rebound."
          />
          <HardwareCard
            img="/mjs-drums/mjs-sticks.jpg"
            title="Drum key + sticks"
            body="Every kit ships ready to play with drum key, sticks and padded throne."
          />
        </div>
      </div>
    </section>
  );
}

function HardwareCard({ img, title, body }: { img: string; title: string; body: string }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-mjs-line bg-background">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="mt-2 text-sm text-mjs-muted">{body}</p>
      </div>
    </article>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono-mjs text-[11px] uppercase tracking-[0.22em] text-mjs-amber">
              Gallery
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
              In the room, in the light.
            </h2>
          </div>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4">
          {galleryTiles.map((tile, index) => (
            <figure
              key={index}
              className={`group relative overflow-hidden rounded-xl border border-mjs-line bg-mjs-surface ${tile.span ?? ""}`}
            >
              <Image
                src={tile.img}
                alt={tile.label}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-background/90 to-transparent p-3 sm:p-4 font-mono-mjs text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                <span className="line-clamp-1">{tile.label}</span>
                <Music2 className="hidden h-3.5 w-3.5 shrink-0 text-mjs-amber sm:block" />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="border-t border-mjs-line py-16 sm:py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="font-mono-mjs text-[11px] uppercase tracking-[0.22em] text-mjs-amber">
            Come play one
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl md:text-6xl">
            Drop by the studio.
            <br />
            <span className="text-mjs-muted">Hit something loud.</span>
          </h2>
          <p className="mt-6 max-w-lg text-mjs-muted">
            We build, demo and tune every kit at Music Jam Space, Kathmandu. Walk in, sit down,
            and play before you take it home.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button asChild size="lg" className="h-12 w-full bg-gradient-amber text-background shadow-glow-amber hover:opacity-90 sm:w-auto">
              <a href="tel:9860342125">
                <Phone className="h-4 w-4" /> 986-0342125
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full border-mjs-line bg-mjs-surface/60 hover:bg-mjs-surface-2 sm:w-auto">
              <a
                href="https://maps.google.com/?q=Bhotebahal+Pipalbot+Dharahara+Kathmandu"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="h-4 w-4" /> Open in Maps
              </a>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-mjs-line bg-mjs-surface p-5 shadow-elegant sm:p-8">
          <div className="font-mono-mjs text-[10px] uppercase tracking-[0.2em] text-mjs-muted">
            Visit us
          </div>
          <div className="mt-3 text-2xl font-medium tracking-tight">Music Jam Space</div>
          <div className="mt-1 text-mjs-muted">
            Bhotebahal, Pipalbot
            <br />
            Near Dharahara Tower
            <br />
            Kathmandu, Nepal
          </div>

          <div className="my-8 h-px bg-mjs-line" />

          <div className="font-mono-mjs text-[10px] uppercase tracking-[0.2em] text-mjs-muted">
            Call / WhatsApp
          </div>
          <a
            href="tel:9860342125"
            className="mt-2 block font-mono-mjs text-2xl tracking-tight text-foreground transition-colors hover:text-mjs-amber"
          >
            986-0342125
          </a>

        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-mjs-line py-10 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 md:flex-row md:items-center md:text-left">
        <div className="flex items-center gap-3">
          <Image
            src="/mjs-drums/logo.png"
            alt="MJS logo"
            width={372}
            height={352}
            className="h-auto w-7 opacity-95"
          />
          <div className="font-mono-mjs text-[10px] uppercase tracking-[0.18em] text-mjs-muted sm:text-[11px] sm:tracking-[0.22em]">
            MJS Custom Drums - Music Jam Space - Kathmandu
          </div>
        </div>
        <div className="font-mono-mjs text-[10px] uppercase tracking-[0.18em] text-mjs-muted sm:text-[11px] sm:tracking-[0.22em]">
          © {new Date().getFullYear()} - Built for feel. Designed for power.
        </div>
      </div>
    </footer>
  );
}
