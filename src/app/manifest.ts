import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();
  return {
    name: "Music Jam Space",
    short_name: "JamSpace",
    description:
      "Nepal's #1 online music store & rehearsal studio — book rooms and buy instruments in Kathmandu.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0c0c1c",
    theme_color: "#0c0c1c",
    categories: ["music", "shopping", "entertainment"],
    icons: [
      {
        src: `${siteUrl}/android-chrome-192x192.png`,
        type: "image/png",
        sizes: "192x192",
        purpose: "any",
      },
      {
        src: `${siteUrl}/android-chrome-512x512.png`,
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: `${siteUrl}/apple-touch-icon.png`,
        type: "image/png",
        sizes: "180x180",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Book a rehearsal room",
        short_name: "Book",
        description: "See availability and book a room online",
        url: "/book",
        icons: [
          {
            src: `${siteUrl}/android-chrome-192x192.png`,
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Music store",
        short_name: "Store",
        description: "Browse instruments and gear",
        url: "/store",
        icons: [
          {
            src: `${siteUrl}/android-chrome-192x192.png`,
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Home",
        short_name: "Home",
        description: "Music Jam Space homepage",
        url: "/",
        icons: [
          {
            src: `${siteUrl}/android-chrome-192x192.png`,
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
