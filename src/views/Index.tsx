"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Disc3,
  Guitar,
  MapPin,
  Menu,
  Mic,
  Music,
  PartyPopper,
  Phone,
  Speaker,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ROOMS, formatRs } from "@/lib/bookingStore";
import type { StoreProduct } from "@/lib/storeProducts";
import { fetchStoreProducts } from "@/lib/api";
import { isUploadImageUrl } from "@/lib/api";

const BOOKING_PHONE_DISPLAY = "986-0342125";
const BOOKING_PHONE_TEL = "+9779860342125";
const GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/nVtFwvEKmXsFoWfq8";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [storePreview, setStorePreview] = useState<StoreProduct[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchStoreProducts({ cache: "no-store" });
        if (active) setStorePreview(list);
      } catch {
        if (active) setStorePreview([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const hasProducts = storePreview.length > 0;
  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Rooms", href: "#rooms" },
    ...(hasProducts ? [{ label: "Store", href: "#store" }] : []),
    { label: "Contact", href: "#contact" },
  ];
  const services = [
    {
      icon: Music,
      title: "Band Practice Room",
      desc: "Spacious AC room with full setup for practice sessions.",
    },
    {
      icon: Mic,
      title: "Recording",
      desc: "Recording support for artists and bands of every level.",
    },
    {
      icon: Speaker,
      title: "Outdoor & Indoor Sound",
      desc: "Professional sound system setup for events of any scale.",
    },
    {
      icon: PartyPopper,
      title: "Live Event Entertainment",
      desc: "Live band artist support for musical events and entertainment.",
    },
    {
      icon: Guitar,
      title: "Mix Mastering",
      desc: "Professional mix and mastering for your tracks.",
    },
    {
      icon: Disc3,
      title: "Live Music Services",
      desc: "Musical event support for indoor and outdoor performances.",
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <header className="fixed top-0 inset-x-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between pt-[max(0rem,env(safe-area-inset-top,0px))]">
          <a href="#" className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/jamspace.jpg"
              alt="Music Jam Space logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md object-cover border border-border/70"
              priority
            />
            <span className="text-sm sm:text-base font-semibold tracking-wider text-primary truncate">
              MUSIC JAM SPACE
            </span>
          </a>
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-foreground/75 hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background px-4 pb-4">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="block py-2.5 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="pt-16">
        <section className="relative min-h-[88dvh] flex items-center justify-center overflow-hidden">
          <Image
            src="/hero-studio.jpg"
            alt="Music Jam Space rehearsal studio"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-wide text-primary">
              Music Jam Space
            </h1>
            <p className="mt-6 text-base sm:text-xl text-foreground/85 leading-relaxed">
              Fully well equipped air-conditioned rehearsal studio and sound
              services designed for musicians of all levels. With a spacious
              setup and top-quality instruments, built for great sound and
              comfort.
            </p>
            <p className="mt-4 text-sm sm:text-base text-foreground/75">
              FeelFreeToDirectContactUs@
              <a
                href={`tel:${BOOKING_PHONE_TEL}`}
                className="text-primary font-semibold underline underline-offset-4"
              >
                {BOOKING_PHONE_DISPLAY}
              </a>
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="min-h-11">
                <a href={`tel:${BOOKING_PHONE_TEL}`}>
                  CALL NOW - {BOOKING_PHONE_DISPLAY}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="min-h-11"
              >
                <Link href="/book">See Schedule</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-5xl text-center font-bold text-primary mb-3">
              Our Services
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-sm sm:text-lg">
              Band practice room / Rehearsal studio / Recording / Outdoor &
              Indoor sound system / Live band artist musical event entertainment
              / Live music
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <article
                  key={s.title}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all"
                >
                  <s.icon className="w-9 h-9 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="rooms" className="py-20 px-3 sm:px-6 bg-card/40">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-5xl text-center font-bold text-primary mb-3">
              Our Rooms
            </h2>
            <p className="text-center text-muted-foreground mb-12 text-sm sm:text-lg">
              Book your jam session today
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ROOMS.map((room) => (
                <article
                  key={room.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
                >
                  <div className="relative h-56">
                    <Image
                      src={room.id === 1 ? "/ROOM%201.jpg" : "/ROOM%202.jpg"}
                      alt={room.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      {room.name}
                    </h3>
                    <p className="text-primary text-2xl font-semibold mb-4">
                      {formatRs(room.price)}
                      <span className="text-muted-foreground text-base ml-2">
                        /hr
                      </span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild className="min-h-11 flex-1">
                        <a
                          href={`tel:${BOOKING_PHONE_TEL}`}
                          className="inline-flex items-center justify-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          BOOK NOW
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="secondary"
                        className="min-h-11 flex-1"
                      >
                        <Link
                          href={`/book?room=${room.id}`}
                          className="inline-flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          See Schedule
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {hasProducts && (
          <section id="store" className="py-20 px-3 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-5xl text-center font-bold text-primary mb-3">
                Store
              </h2>
              <p className="text-center text-muted-foreground mb-12 text-sm sm:text-lg">
                We also sell musical instruments: guitars, drums, and many other
                items.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {storePreview.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/store/${p.id}`}
                    className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
                  >
                    <div className="relative h-52">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        unoptimized={isUploadImageUrl(p.image)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-primary uppercase tracking-widest mb-2">
                        {p.category}
                      </p>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {p.name}
                      </h3>
                      <p className="text-primary font-semibold">
                        Rs. {p.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Button asChild size="lg">
                  <Link href="/store" className="inline-flex items-center gap-2">
                    See More <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-10 rounded-xl border border-border bg-card/60 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-primary mb-2">About MJS</p>
                <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">MJS Custom Drums</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                  MJS is focused on drums. Visit the MJS section to explore custom drum builds and
                  drum details.
                </p>
                <div className="mt-5">
                  <Button asChild>
                    <Link href="/mjs-drums">Visit MJS</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="contact" className="py-20 px-3 sm:px-6 bg-card/40">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-3">
              Get In Touch
            </h2>
            <p className="text-muted-foreground mb-10 text-sm sm:text-lg">
              Feel free to direct contact us
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <article className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
                <Phone className="w-7 h-7 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-1">Call Us</h3>
                <a
                  href={`tel:${BOOKING_PHONE_TEL}`}
                  className="text-primary hover:underline"
                >
                  {BOOKING_PHONE_DISPLAY}
                </a>
              </article>
              <article className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
                <MapPin className="w-7 h-7 text-primary mb-3" />
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center"
                >
                  <h3 className="text-lg font-semibold mb-1 text-primary hover:underline">
                    Visit Us
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed hover:text-foreground transition-colors">
                    Music Jam Space Studio
                    <br />
                    Bhottebahal, Sundhara, Kathmandu
                  </p>
                </a>
              </article>
              <article className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
                <Clock className="w-7 h-7 text-primary mb-3" />
                <Link href="/book" className="text-center">
                  <h3 className="text-lg font-semibold mb-1 text-primary hover:underline">
                    Hours
                  </h3>
                  <p className="text-foreground text-sm font-medium hover:underline">
                    6:00 AM - 9:00 PM
                  </p>
                </Link>
                <p className="text-muted-foreground text-xs mt-1">Open daily</p>
              </article>
            </div>
            <Button asChild size="lg" className="px-10">
              <a href={`tel:${BOOKING_PHONE_TEL}`}>BOOK NOW</a>
            </Button>
          </div>
        </section>

        <footer className="py-8 px-3 sm:px-6 border-t border-border text-center">
          <p className="text-lg tracking-widest text-primary mb-1">
            MUSIC JAM SPACE
          </p>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Music Jam Space. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
