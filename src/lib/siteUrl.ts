/**
 * Canonical public site origin, no trailing slash.
 * Used for metadata, Open Graph, sitemap, and API base when the API is same-origin.
 *
 * Production: set `NEXT_PUBLIC_SITE_URL` (e.g. https://musicjamspace.com).
 * Vercel: if unset, uses `VERCEL_URL` so previews get correct absolute URLs.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:8080";
}
