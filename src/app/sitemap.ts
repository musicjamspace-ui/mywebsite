import type { MetadataRoute } from "next";
import { fetchStoreProducts } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  let products: Awaited<ReturnType<typeof fetchStoreProducts>> = [];
  try {
    products = await fetchStoreProducts({ next: { revalidate: 60 } });
  } catch {
    products = [];
  }

  /** Product detail URLs first — highest crawl priority for instrument search (drums, guitar, keyboard in Nepal, etc.). */
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/store/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  }));

  return [
    ...productRoutes,
    {
      url: `${BASE_URL}/store`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/book`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
