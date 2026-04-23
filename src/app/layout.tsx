import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Music Jam Space | Nepal's #1 Music Store & Rehearsal Studio, Kathmandu",
    template: "%s | Music Jam Space",
  },
  description:
    "Music Jam Space — Nepal's #1 online music store and rehearsal hub in Kathmandu. Buy drums, guitars, keyboards & mics at trusted prices; book AC rehearsal rooms and live sound — Bhottebahal, Sundhara.",
  keywords: [
    "music jam space",
    "#1 music store Nepal",
    "number 1 music store Nepal",
    "best music store Kathmandu",
    "top music shop Nepal",
    "online music store Nepal",
    "buy instruments Nepal",
    "rehearsal studio Kathmandu",
    "rehearsal room Nepal",
    "band practice room Kathmandu",
    "book rehearsal room Nepal",
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
    title: "Music Jam Space | Nepal's #1 Music Store & Rehearsal Studio",
    description:
      "Nepal's #1 online music store & rehearsal studio — instruments, gear, and room booking in Kathmandu.",
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
    title: "Music Jam Space | Nepal's #1 Music Store",
    description:
      "Nepal's #1 music store & rehearsal rooms — Music Jam Space, Kathmandu.",
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
