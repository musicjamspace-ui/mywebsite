import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jamming Room in Kathmandu, Nepal | Music Store | Music Jam Space",
    template: "%s | Music Jam Space",
  },
  description:
    "Music Jam Space is a jamming room and rehearsal studio in Kathmandu, Nepal, with full setup for bands and artists. We also offer a music store in Nepal for guitars, drums, keyboards, microphones, and accessories.",
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
    "#1 music store Nepal",
    "number 1 music store Nepal",
    "best music store Kathmandu",
    "top music shop Nepal",
    "online music store Nepal",
    "buy instruments Nepal",
    "book rehearsal room nepal",
    "music studio Nepal",
    "musical instruments Nepal",
    "drum price in Nepal",
    "guitar price in Nepal",
    "keyboard price in Nepal",
    "buy drums Nepal",
    "buy guitar Nepal",
    "live sound Nepal",
    "recording studio Kathmandu",
    "jam room Kathmandu",
    "Bhottebahal music studio",
    "Sundhara rehearsal room",
  ],
  authors: [{ name: "Music Jam Space" }],
  creator: "Music Jam Space",
  publisher: "Music Jam Space",
  alternates: { canonical: siteUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Music Jam Space",
    title: "Jamming Room in Kathmandu, Nepal | Music Jam Space",
    description:
      "Jamming room and rehearsal studio in Kathmandu, Nepal. Also a trusted music store for guitars, drums, keyboards and mics.",
    url: siteUrl,
    images: [
      {
        url: "/jamspace.jpg",
        width: 1200,
        height: 630,
        alt: "Music Jam Space — Rehearsal Studio in Kathmandu, Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jamming Room in Kathmandu, Nepal | Music Jam Space",
    description:
      "Jamming room in Kathmandu with rehearsal support, plus music store in Nepal for instruments and gear.",
    images: ["/jamspace.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    shortcut: [{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Music Jam Space",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "hsl(220 20% 8%)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
