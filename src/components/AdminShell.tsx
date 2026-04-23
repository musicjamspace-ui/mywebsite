"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setStoredToken, setBookRouteAccess } from "@/lib/api";
import {
  CalendarDays,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Package2,
  TrendingUp,
  Menu,
} from "lucide-react";

export type AdminNavKey = "overview" | "booking" | "store" | "orders" | "revenue" | "history";

interface NavItem {
  key: AdminNavKey;
  label: string;
  icon: React.ElementType;
  href: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { key: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin" },
      { key: "booking", label: "Bookings", icon: CalendarDays, href: "/admin?section=booking" },
      { key: "store", label: "Store", icon: Package2, href: "/admin?section=store" },
      { key: "orders", label: "Orders", icon: ClipboardList, href: "/admin?section=orders" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { key: "revenue", label: "Revenue", icon: TrendingUp, href: "/admin/revenue" },
      { key: "history", label: "History", icon: History, href: "/admin/history" },
    ],
  },
];

interface AdminShellProps {
  children: React.ReactNode;
  activeKey: AdminNavKey;
  /** Red notification badges per nav key (value = count, hidden if 0). */
  badges?: Partial<Record<AdminNavKey, number>>;
  /** Pass a callback to also run custom logic on logout (e.g. reset local authed state). */
  onLogout?: () => void;
}

export default function AdminShell({ children, activeKey, badges = {}, onLogout }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setStoredToken(null);
    setBookRouteAccess(false);
    if (onLogout) {
      onLogout();
    } else {
      router.push("/admin");
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-[18px] shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <Image
            src="/jamspace.jpg"
            alt="Music Jam Space logo"
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
        <p className="text-[13px] font-bold text-white leading-tight tracking-tight">Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeKey === item.key;
                const Icon = item.icon;
                const badgeCount = badges[item.key] ?? 0;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 border",
                      active
                        ? "border-primary/30 bg-primary/15 text-primary shadow-sm"
                        : "border-transparent text-white/40 hover:border-white/5 hover:bg-white/[0.04] hover:text-white/70",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[17px] w-[17px] shrink-0 transition-colors",
                        active ? "text-primary" : "text-white/30 group-hover:text-white/55",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 ? (
                      <span
                        className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-black tabular-nums"
                        style={{
                          background: "#ef4444",
                          color: "white",
                          boxShadow: "0 0 8px rgba(239,68,68,0.6)",
                        }}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : active ? (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                        style={{
                          boxShadow: "0 0 6px hsl(var(--primary) / 0.55)",
                        }}
                      />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.38)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "rgba(255,255,255,0.65)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "";
            e.currentTarget.style.color = "rgba(255,255,255,0.38)";
          }}
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Desktop Sidebar — fixed */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[228px] xl:w-60 z-40 border-r border-border bg-card"
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col border-r border-border bg-card">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Content area — offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-[228px] xl:pl-60">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center gap-3 px-4 py-3 shrink-0 sticky top-0 z-30 border-b border-border bg-card">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="transition-colors"
            aria-label="Open menu"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-[13px] font-semibold text-white">Admin</span>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
