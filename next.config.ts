import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Dev proxy: browser calls same-origin `/api/*`; Next forwards to the remote.
 * Use `NEXT_PUBLIC_DEV_API_PROXY_TARGET` so the client bundle can also switch to relative `/api` URLs.
 * Optional `API_PROXY_REMOTE` is still read here for older `.env.local` setups.
 */
const apiProxyRemote =
  process.env.NEXT_PUBLIC_DEV_API_PROXY_TARGET?.trim().replace(/\/$/, "") ||
  process.env.API_PROXY_REMOTE?.trim().replace(/\/$/, "") ||
  "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /** Monorepo: trace files from repo root (avoids wrong root when multiple lockfiles exist). */
  outputFileTracingRoot: path.join(__dirname, ".."),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "musicjamspace.com", pathname: "/**" },
      { protocol: "https", hostname: "www.musicjamspace.com", pathname: "/**" },
      { protocol: "https", hostname: "musicjamspace.com.np", pathname: "/**" },
      { protocol: "https", hostname: "www.musicjamspace.com.np", pathname: "/**" },
    ],
  },
  async rewrites() {
    if (!apiProxyRemote) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyRemote}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
