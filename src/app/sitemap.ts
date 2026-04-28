import type { MetadataRoute } from "next";
import { fetchStoreProducts } from "@/lib/api";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date().toISOString();

  let products: Awaited<ReturnType<typeof fetchStoreProducts>> = [];
  try {
    products = await fetchStoreProducts({ next: { revalidate: 60 } });
  } catch {
    products = [];
  }

  /** Product detail URLs first — highest crawl priority for instrument search (drums, guitar, keyboard in Nepal, etc.). */
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/store/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  }));

  return [
    ...productRoutes,
    {
      url: `${siteUrl}/store`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/book`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/mjs-drums`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
