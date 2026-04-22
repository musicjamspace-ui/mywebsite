import type { Metadata } from "next";

/** Keep admin out of search results (robots.txt also disallows /admin). */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
