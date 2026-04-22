"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
  Package2,
  Pencil,
  Phone,
  Plus,
  Save,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  API_BASE,
  apiLogin,
  createOrderApi,
  deleteOrderApi,
  fetchOrdersApi,
  getStoredToken,
  onAdminAuthLost,
  setBookRouteAccess,
  setStoredToken,
  type StoreOrder,
  updateOrderApi,
} from "@/lib/api";
import {
  formatHourRange,
  formatRs,
  getHourInKathmandu,
  getYmdInKathmandu,
  ROOMS,
  type Booking,
} from "@/lib/bookingStore";
import {
  productGalleryImages,
  STORE_PRODUCTS,
  type StoreProduct,
} from "@/lib/storeProducts";
import CalendarGrid from "@/components/CalendarGrid";
import AdminForm from "@/components/AdminForm";
import AdminShell from "@/components/AdminShell";
import { useBookingsQuery } from "@/hooks/useBookingsQuery";
import { useKathmanduDayKey } from "@/hooks/useKathmanduDayKey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AdminSection = "overview" | "booking" | "store" | "orders";
type StoreCategoryFilter = "all" | string;

type AdminOrder = StoreOrder;

type ProductForm = {
  id: string;
  name: string;
  category: string;
  price: string;
  /** All gallery images — index 0 is always the cover/thumbnail */
  galleryImages: string[];
  description: string;
  bestForText: string;
  highlightsText: string;
  specsText: string;
};

const INITIAL_ORDERS: AdminOrder[] = [];

function toMultiLine(items: string[]) {
  return items.join("\n");
}

function splitLines(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formFromProduct(product?: StoreProduct): ProductForm {
  if (!product) {
    return {
      id: "",
      name: "",
      category: "",
      price: "",
      galleryImages: [],
      description: "",
      bestForText: "",
      highlightsText: "",
      specsText: "",
    };
  }
  // Build gallery: images array wins; if absent fall back to cover image
  const gallery = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: String(product.price),
    galleryImages: gallery,
    description: product.description,
    bestForText: toMultiLine(product.bestFor),
    highlightsText: toMultiLine(product.highlights),
    specsText: product.specs.map((s) => `${s.label}: ${s.value}`).join("\n"),
  };
}

// ─── Image Gallery Editor ─────────────────────────────────────────────────────

type GalleryItem = { url: string; uploading?: boolean; error?: boolean };

function ImageGalleryEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [items, setItems] = useState<GalleryItem[]>(() =>
    images.map((url) => ({ url })),
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep parent form state in sync whenever items settle
  useEffect(() => {
    onChange(
      items.filter((i) => !i.uploading && !i.error && i.url).map((i) => i.url),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Reset when parent switches products (via key prop on the component)
  useEffect(() => {
    setItems(images.map((url) => ({ url })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const preview = URL.createObjectURL(file);
      setItems((prev) => [...prev, { url: preview, uploading: true }]);
      const fd = new FormData();
      fd.append("file", file);
      const token = getStoredToken();
      try {
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Upload failed");
        }
        const data = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.url === preview ? { url: data.url } : i)),
        );
        URL.revokeObjectURL(preview);
      } catch (e) {
        setItems((prev) =>
          prev.map((i) =>
            i.url === preview ? { ...i, uploading: false, error: true } : i,
          ),
        );
        toast.error(`Upload failed: ${(e as Error).message}`);
      }
    }
    // Reset file input so the same file can be re-selected after an error
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));
  const makeCover = (idx: number) =>
    setItems((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      return [item, ...copy];
    });

  return (
    <div className="space-y-3">
      {/* Thumbnails strip */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              className="relative group rounded-lg overflow-hidden shrink-0"
              style={{
                width: 80,
                height: 80,
                border:
                  idx === 0
                    ? "2px solid rgba(226,232,240,0.6)"
                    : "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {/* Preview image */}
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: item.uploading ? 0.4 : item.error ? 0.2 : 1 }}
              />

              {/* Uploading spinner */}
              {item.uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    style={{ color: "#e2e8f0" }}
                  />
                </div>
              )}

              {/* Error state */}
              {item.error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-red-400 text-center px-1">
                    Failed
                  </span>
                </div>
              )}

              {/* Cover badge (first item) */}
              {idx === 0 && !item.uploading && !item.error && (
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 py-0.5"
                  style={{
                    background: "rgba(148,163,184,0.8)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#f8fafc",
                    letterSpacing: "0.1em",
                  }}
                >
                  <Star className="h-2.5 w-2.5 fill-current" />
                  COVER
                </div>
              )}

              {/* Hover controls */}
              {!item.uploading && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.65)" }}
                >
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(idx)}
                      title="Set as cover"
                      className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                      style={{
                        background: "rgba(148,163,184,0.8)",
                        color: "#f8fafc",
                      }}
                    >
                      <Star className="h-2.5 w-2.5" /> Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    title="Remove"
                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{
                      background: "rgba(248,113,113,0.8)",
                      color: "white",
                    }}
                  >
                    <Trash2 className="h-2.5 w-2.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium w-full justify-center transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.5)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(226,232,240,0.5)";
          e.currentTarget.style.color = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
        }}
      >
        <ImagePlus className="h-4 w-4" />
        {items.length === 0 ? "Upload images" : "Add more images"}
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          · first = cover
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── parseSpecs ───────────────────────────────────────────────────────────────

function parseSpecs(text: string) {
  const lines = splitLines(text);
  const specs: { label: string; value: string }[] = [];
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!label || !value) continue;
    specs.push({ label, value });
  }
  return specs;
}

/** KPI card used in the Overview dashboard */

function useLiveClock() {
  const [tick, setTick] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

function OverviewSection({
  bookings,
  orders,
}: {
  bookings: Booking[];
  orders: AdminOrder[];
}) {
  const kathmanduDayKey = useKathmanduDayKey();
  const tick = useLiveClock();

  // Kathmandu offset: UTC+5:45
  const nptMs = tick.getTime() + (5 * 60 + 45) * 60 * 1000;
  const nptDate = new Date(nptMs);
  const nptHH = String(nptDate.getUTCHours()).padStart(2, "0");
  const nptMM = String(nptDate.getUTCMinutes()).padStart(2, "0");
  const nptSS = String(nptDate.getUTCSeconds()).padStart(2, "0");
  const liveTime = `${nptHH}:${nptMM}:${nptSS}`;
  const liveDate = nptDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kathmandu",
  });

  const todayYmd = getYmdInKathmandu(tick);
  const currentHour = getHourInKathmandu(tick);
  // Seconds remaining in the current hour slot
  const secsIntoHour = nptDate.getUTCMinutes() * 60 + nptDate.getUTCSeconds();
  const secsLeft = 3600 - secsIntoHour;
  const minsLeft = Math.floor(secsLeft / 60);
  const secsRem = secsLeft % 60;
  const countdown = `${String(minsLeft).padStart(2, "0")}m ${String(secsRem).padStart(2, "0")}s`;

  const roomStatus = useMemo(() => {
    void kathmanduDayKey;
    return ROOMS.map((room) => {
      const current = bookings.find(
        (b) =>
          b.room === room.id && b.date === todayYmd && b.hour === currentHour,
      );
      const nextBooking = bookings
        .filter(
          (b) =>
            b.room === room.id && b.date === todayYmd && b.hour > currentHour,
        )
        .sort((a, b) => a.hour - b.hour)[0];
      return { room, current, nextBooking };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, kathmanduDayKey, todayYmd, currentHour]);

  const quickActions = [
    {
      label: "Bookings",
      desc: "Manage room reservations",
      href: "/admin?section=booking",
      icon: CalendarDays,
      accent: "#e2e8f0",
      bg: "rgba(148,163,184,0.14)",
      border: "rgba(148,163,184,0.3)",
    },
    {
      label: "Store",
      desc: "Products catalogue",
      href: "/admin?section=store",
      icon: Package2,
      accent: "#60a5fa",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.28)",
    },
    {
      label: "Orders",
      desc: "Buy Now order tracker",
      href: "/admin?section=orders",
      icon: ShoppingBag,
      accent: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.28)",
    },
    {
      label: "Revenue",
      desc: "Earnings & charts",
      href: "/admin/revenue",
      icon: TrendingUp,
      accent: "#cbd5e1",
      bg: "rgba(203,213,225,0.1)",
      border: "rgba(203,213,225,0.22)",
    },
    {
      label: "History",
      desc: "Past booking calendar",
      href: "/admin/history",
      icon: Zap,
      accent: "#f472b6",
      bg: "rgba(244,114,182,0.12)",
      border: "rgba(244,114,182,0.28)",
    },
  ];

  return (
    <div className="p-6 space-y-7">
      {/* Header with live clock */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            {liveDate}
          </p>
        </div>
        {/* Live clock */}
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3 shrink-0"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="h-2 w-2 rounded-full shrink-0 animate-pulse"
            style={{
              background: "#34d399",
              boxShadow: "0 0 8px rgba(52,211,153,0.7)",
            }}
          />
          <span
            className="font-mono text-2xl font-bold tracking-widest"
            style={{ color: "#f8fafc" }}
          >
            {liveTime}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            NPT
          </span>
        </div>
      </div>

      {/* Room Status — full width */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Room Status · Live
          </p>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#34d399", display: "inline-block" }}
            />
            Real-time
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roomStatus.map(({ room, current, nextBooking }) => {
            const busy = !!current;
            return (
              <div
                key={room.id}
                className="relative rounded-xl p-5 overflow-hidden"
                style={{
                  background: busy
                    ? "rgba(248,113,113,0.05)"
                    : "rgba(52,211,153,0.05)",
                  border: `1px solid ${busy ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.15)"}`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                  style={{
                    background: busy
                      ? "rgba(248,113,113,0.5)"
                      : "rgba(52,211,153,0.5)",
                  }}
                />

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-bold text-white">
                      {room.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {room.price
                        ? `NPR ${room.price.toLocaleString()}/hr`
                        : ""}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-[11px] font-black px-3 py-1 rounded-full tracking-widest"
                    style={{
                      background: busy
                        ? "rgba(248,113,113,0.15)"
                        : "rgba(52,211,153,0.15)",
                      color: busy ? "#f87171" : "#34d399",
                      border: `1px solid ${busy ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
                    }}
                  >
                    {busy ? "BUSY" : "FREE"}
                  </span>
                </div>

                {/* Status line */}
                <div className="space-y-1.5">
                  {busy ? (
                    <>
                      <p className="text-sm font-semibold text-white truncate">
                        {current!.bandName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        Slot ends in{" "}
                        <span
                          className="font-mono font-bold"
                          style={{ color: "#f87171" }}
                        >
                          {countdown}
                        </span>{" "}
                        · {formatHourRange(current!.hour)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#34d399" }}
                      >
                        Available now
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {nextBooking
                          ? `Next: ${nextBooking.bandName} at ${formatHourRange(nextBooking.hour)}`
                          : "No more bookings today"}
                      </p>
                    </>
                  )}
                </div>

                {/* Pulsing dot */}
                <div
                  className="absolute bottom-4 right-4 h-3 w-3 rounded-full animate-pulse"
                  style={{
                    background: busy ? "#f87171" : "#34d399",
                    boxShadow: busy
                      ? "0 0 12px rgba(248,113,113,0.7)"
                      : "0 0 12px rgba(52,211,153,0.7)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Orders */}
      {orders.length > 0 &&
        (() => {
          const latest = [...orders].slice(0, 3);
          const statusColor: Record<AdminOrder["status"], string> = {
            New: "#e2e8f0",
            Contacted: "#fbbf24",
            Dispatched: "#60a5fa",
            Delivered: "#34d399",
          };
          const statusBg: Record<AdminOrder["status"], string> = {
            New: "rgba(226,232,240,0.12)",
            Contacted: "rgba(251,191,36,0.12)",
            Dispatched: "rgba(96,165,250,0.12)",
            Delivered: "rgba(52,211,153,0.12)",
          };
          return (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Latest Orders
                </p>
                <Link
                  href="/admin?section=orders"
                  className="text-[11px] font-semibold hover:underline"
                  style={{ color: "#e2e8f0" }}
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-2.5">
                {latest.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white truncate">
                          {o.customer}
                        </p>
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          {o.id}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "rgba(255,255,255,0.38)" }}
                      >
                        {o.productName} · {formatRs(o.amount)}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: statusBg[o.status],
                        color: statusColor[o.status],
                        border: `1px solid ${statusColor[o.status]}30`,
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      {/* Quick Actions */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative flex flex-col gap-3 rounded-xl p-4 transition-all duration-150 overflow-hidden"
                style={{
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 8px 24px ${action.bg}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                {/* Top glow accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${action.accent}60, transparent)`,
                  }}
                />
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                  style={{
                    background: `${action.accent}20`,
                    border: `1px solid ${action.accent}30`,
                  }}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    style={{ color: action.accent }}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{action.label}</p>
                  <p
                    className="text-[11px] mt-0.5 leading-tight"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {action.desc}
                  </p>
                </div>
                <div
                  className="text-[11px] font-semibold flex items-center gap-1 mt-auto"
                  style={{ color: action.accent }}
                >
                  Open →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StoreProductPreview({ product }: { product: StoreProduct }) {
  const gallery = productGalleryImages(product).slice(0, 3);

  return (
    <div
      className="rounded-xl overflow-hidden sticky top-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Preview header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Live Preview
        </p>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(226,232,240,0.12)", color: "#e2e8f0" }}
        >
          {product.category}
        </span>
      </div>

      {/* Gallery */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {gallery.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="relative aspect-square overflow-hidden rounded-lg"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Image
                src={img}
                alt={`${product.name} ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Product info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {product.name}
            </h3>
            <p
              className="text-xl font-bold mt-1 tabular-nums"
              style={{ color: "#e2e8f0" }}
            >
              {formatRs(product.price)}
            </p>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {product.description}
          </p>

          {/* Best For tags */}
          {product.bestFor.length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Best For
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.bestFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {product.highlights.length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Highlights
              </p>
              <ul className="space-y-1.5">
                {product.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <span
                      className="mt-1.5 h-1 w-1 rounded-full shrink-0"
                      style={{ background: "#e2e8f0" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specs */}
          {product.specs.length > 0 && (
            <div
              className="rounded-lg p-3 space-y-1.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Specs
              </p>
              {product.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between gap-2 text-xs"
                >
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>
                    {s.label}
                  </span>
                  <span
                    className="font-medium text-right"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Booking Overlay ───────────────────────────────────────────────

function FullscreenBooking({
  bookings,
  selectedRoom,
  setSelectedRoom,
  refreshKey,
  editBooking,
  prefill,
  onSlotClick,
  onAdminSelectBooking,
  onDone,
  onClose,
  RoomTabs,
}: {
  bookings: Booking[];
  selectedRoom: 1 | 2;
  setSelectedRoom: (r: 1 | 2) => void;
  refreshKey: number;
  editBooking: Booking | null;
  prefill: { room: number; date: string; hour: number } | null;
  onSlotClick: (room: number, date: string, hour: number) => void;
  onAdminSelectBooking: (b: Booking) => void;
  onDone: () => void;
  onClose: () => void;
  RoomTabs: React.ComponentType;
}) {
  const tick = useLiveClock();
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  const nptMs = tick.getTime() + (5 * 60 + 45) * 60 * 1000;
  const nptDate = new Date(nptMs);
  const liveTime = [
    String(nptDate.getUTCHours()).padStart(2, "0"),
    String(nptDate.getUTCMinutes()).padStart(2, "0"),
    String(nptDate.getUTCSeconds()).padStart(2, "0"),
  ].join(":");

  const todayYmd = getYmdInKathmandu(tick);
  const bookedToday = bookings.filter((b) => b.date === todayYmd).length;
  const activeRoom = ROOMS.find((r) => r.id === selectedRoom)!;

  // Lock body scroll + close on Escape
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  useEffect(() => {
    const onResize = () => setIsMobileLayout(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Portal to document.body so it renders completely outside AdminShell's DOM tree
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-background"
    >
      {/* ── Top bar ── */}
      <div
        className={`flex items-center justify-between gap-3 shrink-0 flex-wrap ${isMobileLayout ? "px-3 py-2.5" : "px-5 py-3"}`}
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {/* Left: title + room tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm font-bold text-white">Schedule — Fullscreen</p>
          <RoomTabs />
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(226,232,240,0.1)",
              color: "#e2e8f0",
              border: "1px solid rgba(226,232,240,0.2)",
            }}
          >
            {activeRoom.name} · {formatRs(activeRoom.price)}/hr
          </span>
          {!isMobileLayout && (
            <span
              className="text-[10px]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Click any available slot to prefill the form below
            </span>
          )}
        </div>

        {/* Right: live clock + stats + close */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
              style={{
                background: "#34d399",
                boxShadow: "0 0 6px rgba(52,211,153,0.7)",
              }}
            />
            <span
              className="font-mono text-base font-bold tabular-nums tracking-widest"
              style={{ color: "#f8fafc" }}
            >
              {liveTime}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              NPT
            </span>
          </div>
          {!isMobileLayout && (
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(226,232,240,0.08)",
                color: "#e2e8f0",
                border: "1px solid rgba(226,232,240,0.15)",
              }}
            >
              {bookedToday} booked today
            </span>
          )}
          {isMobileLayout && (
            <button
              type="button"
              onClick={() => setShowMobileForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: "rgba(148,163,184,0.15)",
                border: "1px solid rgba(148,163,184,0.3)",
                color: "#f8fafc",
              }}
            >
              {showMobileForm ? "Hide Form" : "Show Form"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Exit fullscreen (Esc)"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Exit
          </button>
        </div>
      </div>

      {/* ── Calendar (scrollable) ── */}
      <div
        className={`flex-1 overflow-auto ${isMobileLayout ? "p-1.5" : "p-3"}`}
      >
        <CalendarGrid
          room={activeRoom}
          bookings={bookings}
          refreshKey={refreshKey}
          onSlotClick={onSlotClick}
          onAdminSelectBooking={onAdminSelectBooking}
          isAdmin
        />
      </div>

      {/* ── Booking form (pinned bottom) ── */}
      {(!isMobileLayout || showMobileForm) && (
        <div
          className="shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(7,7,15,0.97)",
          }}
        >
          <AdminForm
            bookings={bookings}
            editBooking={editBooking}
            prefill={prefill}
            onDone={onDone}
          />
        </div>
      )}
    </div>,
    document.body,
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [prefill, setPrefill] = useState<{
    room: number;
    date: string;
    hour: number;
  } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<1 | 2>(1);
  const [fullscreenBooking, setFullscreenBooking] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  const [products, setProducts] = useState<StoreProduct[]>(STORE_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState(
    STORE_PRODUCTS[0]?.id ?? "",
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(() =>
    formFromProduct(STORE_PRODUCTS[0]),
  );
  const [storeCategoryFilter, setStoreCategoryFilter] =
    useState<StoreCategoryFilter>("all");

  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);

  const { data: bookings = [] } = useBookingsQuery();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawSection = searchParams.get("section");
  const section: AdminSection = (
    ["booking", "store", "orders"] as const
  ).includes(rawSection as "booking")
    ? (rawSection as "booking" | "store" | "orders")
    : "overview";

  // Mobile admin landing: open booking directly.
  useEffect(() => {
    if (!authed) return;
    if (!isNarrowViewport) return;
    if (rawSection !== null) return;
    router.replace("/admin?section=booking");
  }, [authed, isNarrowViewport, rawSection, router]);

  useEffect(() => {
    if (getStoredToken()) setAuthed(true);
    setAuthChecked(true);
  }, []);

  useEffect(() => onAdminAuthLost(() => setAuthed(false)), []);

  useEffect(() => {
    if (!authed) return;
    let active = true;
    (async () => {
      setOrdersLoading(true);
      try {
        const data = await fetchOrdersApi();
        if (!active) return;
        setOrders(data);
      } catch (err) {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Failed to load orders",
        );
      } finally {
        if (active) setOrdersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authed]);

  useEffect(() => {
    const update = () => setIsNarrowViewport(window.innerWidth < 1200);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [products, selectedProductId],
  );
  const forceBookingFullscreen =
    authed && section === "booking" && isNarrowViewport;

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    setEditBooking(null);
    setPrefill(null);
  };

  const handleSlotClick = (room: number, date: string, hour: number) => {
    setPrefill({ room, date, hour });
    setEditBooking(null);
    router.push("/admin?section=booking");
  };

  const handleAdminSelectBooking = (b: Booking) => {
    setEditBooking(b);
    setPrefill(null);
    router.push("/admin?section=booking");
  };

  const selectProductForEdit = (product: StoreProduct) => {
    setSelectedProductId(product.id);
    setEditingProductId(product.id);
    setProductForm(formFromProduct(product));
    setShowProductModal(true);
  };

  const handleProductSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = productForm.id.trim();
    const name = productForm.name.trim();
    const category = productForm.category.trim();
    const description = productForm.description.trim();
    const price = Number(productForm.price);
    const bestFor = splitLines(productForm.bestForText);
    const highlights = splitLines(productForm.highlightsText);
    const specs = parseSpecs(productForm.specsText);
    const gallery = productForm.galleryImages.filter(Boolean);
    const image = gallery[0] || "/jamspace.jpg";

    if (!id || !name || !category || !description) {
      toast.error("Please fill id, name, category, and description.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid product price.");
      return;
    }
    if (bestFor.length === 0 || highlights.length === 0) {
      toast.error("Best For and Highlights need at least one line.");
      return;
    }

    const next: StoreProduct = {
      id,
      name,
      category,
      price,
      image,
      images: gallery.length ? gallery : undefined,
      description,
      bestFor,
      highlights,
      specs,
    };

    setProducts((prev) => {
      if (editingProductId)
        return prev.map((p) => (p.id === editingProductId ? next : p));
      if (prev.some((p) => p.id === next.id)) {
        toast.error("Product ID already exists.");
        return prev;
      }
      return [next, ...prev];
    });
    setSelectedProductId(next.id);
    setEditingProductId(next.id);
    toast.success(editingProductId ? "Product updated." : "Product created.");
    setShowProductModal(false);
  };

  const handleProductDelete = () => {
    if (!editingProductId) return;
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== editingProductId);
      const fallback = filtered[0];
      setSelectedProductId(fallback?.id ?? "");
      setProductForm(formFromProduct(fallback));
      setEditingProductId(fallback?.id ?? null);
      return filtered;
    });
    setShowProductModal(false);
    toast.success("Product deleted.");
  };

  const startNewProduct = () => {
    setEditingProductId(null);
    setProductForm(formFromProduct(undefined));
    setShowProductModal(true);
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        {/* Ambient glow */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(148,163,184,0.12), transparent)",
          }}
        />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const { token } = await apiLogin(password);
              setStoredToken(token);
              setBookRouteAccess(true);
              setAuthed(true);
              setPassword("");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Login failed");
            }
          }}
          className="relative w-full max-w-sm space-y-5 rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(226,232,240,0.6), transparent)",
            }}
          />

          <div className="text-center pb-2">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(148,163,184,0.3), rgba(51,65,85,0.4))",
                border: "1px solid rgba(148,163,184,0.3)",
              }}
            >
              <span className="text-2xl select-none">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-white">Admin Login</h2>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Music Jam Space · Control Panel
            </p>
          </div>

          <div className="space-y-2">
            <Label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Password
            </Label>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold"
            style={{
              background: "linear-gradient(135deg, #e2e8f0, #64748b)",
              border: "none",
              boxShadow: "0 4px 20px rgba(148,163,184,0.3)",
            }}
          >
            Sign In
          </Button>

          <Link
            href="/"
            className="block text-center text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            ← Back to home
          </Link>
        </form>
      </div>
    );
  }

  const activeNavKey =
    section === "overview"
      ? "overview"
      : section === "booking"
        ? "booking"
        : section === "store"
          ? "store"
          : "orders";

  return (
    <AdminShell
      activeKey={activeNavKey}
      onLogout={() => setAuthed(false)}
      badges={{
        orders: orders.filter((o) => o.status === "New").length || undefined,
      }}
    >
      <div className="min-h-full">
        {section === "overview" && (
          <OverviewSection bookings={bookings} orders={orders} />
        )}

        {section === "booking" &&
          (() => {
            const now = new Date();
            const todayYmd = getYmdInKathmandu(now);
            const todayBookings = bookings.filter((b) => b.date === todayYmd);
            const upcomingBookings = bookings.filter((b) => b.date > todayYmd);
            const bookedToday = todayBookings.length;
            const occupancy = Math.round(
              (bookedToday / (15 * ROOMS.length)) * 100,
            );

            // Shared room-tab + calendar strip used in both normal and fullscreen
            const RoomTabs = () => (
              <div className="flex gap-1.5">
                {ROOMS.map((r) => {
                  const active = selectedRoom === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoom(r.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      style={
                        active
                          ? {
                              background: "rgba(148,163,184,0.2)",
                              border: "1px solid rgba(148,163,184,0.4)",
                              color: "#f8fafc",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.45)",
                            }
                      }
                    >
                      {r.name.split(" (")[0]}
                    </button>
                  );
                })}
              </div>
            );

            return (
              <>
                {/* ── Fullscreen overlay ── */}
                {(fullscreenBooking || forceBookingFullscreen) && (
                  <FullscreenBooking
                    bookings={bookings}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    refreshKey={refreshKey}
                    editBooking={editBooking}
                    prefill={prefill}
                    onSlotClick={handleSlotClick}
                    onAdminSelectBooking={handleAdminSelectBooking}
                    onDone={refresh}
                    onClose={() => {
                      // On narrow screens, booking view stays in fullscreen mode.
                      if (!forceBookingFullscreen) setFullscreenBooking(false);
                    }}
                    RoomTabs={RoomTabs}
                  />
                )}

                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Booking Management
                      </h1>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Create, update, and manage rehearsal bookings
                      </p>
                    </div>
                    {!forceBookingFullscreen && (
                      <button
                        type="button"
                        onClick={() => setFullscreenBooking(true)}
                        className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all"
                        style={{
                          background: "rgba(148,163,184,0.15)",
                          border: "1px solid rgba(148,163,184,0.3)",
                          color: "#f8fafc",
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                        Fullscreen
                      </button>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Today's Bookings",
                        value: String(bookedToday),
                        accent: "#e2e8f0",
                      },
                      {
                        label: "Upcoming",
                        value: String(upcomingBookings.length),
                        accent: "#34d399",
                      },
                      {
                        label: "Total Active",
                        value: String(bookings.length),
                        accent: "#cbd5e1",
                      },
                      {
                        label: "Today Occupancy",
                        value: `${occupancy}%`,
                        accent: bookedToday > 0 ? "#f87171" : "#34d399",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl p-4"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {s.label}
                        </p>
                        <p
                          className="text-2xl font-bold tabular-nums"
                          style={{ color: s.accent }}
                        >
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ── Schedule View ── */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <p
                          className="text-[11px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          Schedule View
                        </p>
                        <RoomTabs />
                        <p
                          className="text-[10px]"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          Click any available slot to prefill the booking form
                        </p>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                        style={{
                          background: "rgba(226,232,240,0.1)",
                          color: "#e2e8f0",
                          border: "1px solid rgba(226,232,240,0.2)",
                        }}
                      >
                        {ROOMS.find((r) => r.id === selectedRoom)?.name} ·{" "}
                        {formatRs(
                          ROOMS.find((r) => r.id === selectedRoom)?.price ?? 0,
                        )}
                        /hr
                      </span>
                    </div>
                    <div className="p-2">
                      <CalendarGrid
                        room={ROOMS.find((r) => r.id === selectedRoom)!}
                        bookings={bookings}
                        refreshKey={refreshKey}
                        onSlotClick={handleSlotClick}
                        onAdminSelectBooking={handleAdminSelectBooking}
                        isAdmin
                      />
                    </div>
                  </div>

                  {/* ── Booking form ── */}
                  <AdminForm
                    bookings={bookings}
                    editBooking={editBooking}
                    prefill={prefill}
                    onDone={refresh}
                  />
                </div>
              </>
            );
          })()}

        {section === "store" && (
          <>
            {/* ── Product Add/Edit Modal ── */}
            {showProductModal &&
              createPortal(
                <div
                  className="fixed inset-0 flex items-center justify-center p-4"
                  style={{ background: "rgba(0,0,0,0.82)", zIndex: 9999 }}
                  onClick={() => setShowProductModal(false)}
                >
                  <div
                    className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-card"
                    style={{
                      maxHeight: "92vh",
                      overflowY: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{
                        background:
                          "linear-gradient(90deg, #e2e8f0, #475569, transparent)",
                      }}
                    />
                    <div
                      className="flex items-center justify-between px-6 py-4"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        background: editingProductId
                          ? "rgba(226,232,240,0.05)"
                          : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {editingProductId ? (
                          <Pencil
                            className="h-4 w-4"
                            style={{ color: "#e2e8f0" }}
                          />
                        ) : (
                          <Plus
                            className="h-4 w-4"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          />
                        )}
                        <p className="text-sm font-bold text-white">
                          {editingProductId
                            ? "Edit Product"
                            : "Add New Product"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingProductId && (
                          <button
                            type="button"
                            onClick={handleProductDelete}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                            style={{
                              background: "rgba(248,113,113,0.1)",
                              border: "1px solid rgba(248,113,113,0.2)",
                              color: "#f87171",
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowProductModal(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <form
                      onSubmit={handleProductSave}
                      className="p-6 space-y-5"
                    >
                      <div className="space-y-3">
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          Basic Info
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label
                              className="text-[11px] font-bold uppercase tracking-[0.1em]"
                              style={{ color: "rgba(255,255,255,0.38)" }}
                            >
                              Product ID
                            </Label>
                            <Input
                              value={productForm.id}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  id: e.target.value,
                                }))
                              }
                              placeholder="drum-kit"
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-[11px] font-bold uppercase tracking-[0.1em]"
                              style={{ color: "rgba(255,255,255,0.38)" }}
                            >
                              Price (NPR)
                            </Label>
                            <Input
                              value={productForm.price}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  price: e.target.value,
                                }))
                              }
                              placeholder="28000"
                              inputMode="numeric"
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-[11px] font-bold uppercase tracking-[0.1em]"
                              style={{ color: "rgba(255,255,255,0.38)" }}
                            >
                              Name
                            </Label>
                            <Input
                              value={productForm.name}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Professional Drum Kit"
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-[11px] font-bold uppercase tracking-[0.1em]"
                              style={{ color: "rgba(255,255,255,0.38)" }}
                            >
                              Category
                            </Label>
                            {/* datalist lets users pick existing or type a new one */}
                            <input
                              list="product-categories"
                              value={productForm.category}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  category: e.target.value,
                                }))
                              }
                              placeholder="Drums"
                              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                            <datalist id="product-categories">
                              {Array.from(
                                new Set(
                                  products
                                    .map((p) => p.category)
                                    .filter(Boolean),
                                ),
                              ).map((cat) => (
                                <option key={cat} value={cat} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-[11px] font-bold uppercase tracking-[0.1em]"
                            style={{ color: "rgba(255,255,255,0.38)" }}
                          >
                            Description
                          </Label>
                          <Textarea
                            rows={3}
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm((f) => ({
                                ...f,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Complete 5-piece drum kit with hardware…"
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 resize-y"
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      />
                      <div className="space-y-3">
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          Media
                        </p>
                        <ImageGalleryEditor
                          key={editingProductId ?? "new"}
                          images={productForm.galleryImages}
                          onChange={(imgs) =>
                            setProductForm((f) => ({
                              ...f,
                              galleryImages: imgs,
                            }))
                          }
                        />
                      </div>
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      />
                      <div className="space-y-3">
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          Content
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label
                              className="text-[11px] font-bold uppercase tracking-[0.1em]"
                              style={{ color: "rgba(255,255,255,0.38)" }}
                            >
                              Best For{" "}
                              <span style={{ color: "rgba(255,255,255,0.22)" }}>
                                (one per line)
                              </span>
                            </Label>
                            <Textarea
                              rows={3}
                              value={productForm.bestForText}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  bestForText: e.target.value,
                                }))
                              }
                              placeholder={
                                "Live performances\nRecording sessions"
                              }
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 resize-y"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-[11px] font-bold uppercase tracking-[0.1em]"
                              style={{ color: "rgba(255,255,255,0.38)" }}
                            >
                              Highlights{" "}
                              <span style={{ color: "rgba(255,255,255,0.22)" }}>
                                (one per line)
                              </span>
                            </Label>
                            <Textarea
                              rows={3}
                              value={productForm.highlightsText}
                              onChange={(e) =>
                                setProductForm((f) => ({
                                  ...f,
                                  highlightsText: e.target.value,
                                }))
                              }
                              placeholder={
                                "Comfortable neck profile\nVersatile tone"
                              }
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 resize-y"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            className="text-[11px] font-bold uppercase tracking-[0.1em]"
                            style={{ color: "rgba(255,255,255,0.38)" }}
                          >
                            Specs{" "}
                            <span style={{ color: "rgba(255,255,255,0.22)" }}>
                              (Label: Value per line)
                            </span>
                          </Label>
                          <Textarea
                            rows={4}
                            value={productForm.specsText}
                            onChange={(e) =>
                              setProductForm((f) => ({
                                ...f,
                                specsText: e.target.value,
                              }))
                            }
                            placeholder={
                              "Pieces: 5-piece\nIncluded: Kick, snare, toms, cymbals"
                            }
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 resize-y font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div
                        className="flex gap-2 pt-1"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          paddingTop: "1.25rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setShowProductModal(false)}
                          className="rounded-lg px-4 py-2.5 text-sm font-semibold"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.55)",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg, #e2e8f0, #64748b)",
                            color: "white",
                            boxShadow: "0 4px 16px rgba(148,163,184,0.25)",
                          }}
                        >
                          <Save className="h-4 w-4" />
                          {editingProductId ? "Update Product" : "Add Product"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>,
                document.body,
              )}

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Store Management
                  </h1>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Manage products displayed in the public store
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(226,232,240,0.1)",
                      color: "#e2e8f0",
                      border: "1px solid rgba(226,232,240,0.2)",
                    }}
                  >
                    {products.length} product{products.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={startNewProduct}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold"
                    style={{
                      background: "rgba(148,163,184,0.2)",
                      border: "1px solid rgba(148,163,184,0.35)",
                      color: "#f8fafc",
                    }}
                  >
                    <Plus className="h-4 w-4" /> New Product
                  </button>
                </div>
              </div>

              {/* Category filter */}
              {(() => {
                const categories = [
                  "all",
                  ...Array.from(new Set(products.map((p) => p.category))),
                ];
                const filtered =
                  storeCategoryFilter === "all"
                    ? products
                    : products.filter(
                        (p) => p.category === storeCategoryFilter,
                      );
                return (
                  <>
                    <div className="flex gap-1.5 flex-wrap">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStoreCategoryFilter(cat)}
                          className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all"
                          style={
                            storeCategoryFilter === cat
                              ? {
                                  background: "rgba(226,232,240,0.18)",
                                  color: "#f8fafc",
                                  border: "1px solid rgba(226,232,240,0.3)",
                                }
                              : {
                                  background: "rgba(255,255,255,0.04)",
                                  color: "rgba(255,255,255,0.35)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }
                          }
                        >
                          {cat === "all" ? `All (${products.length})` : cat}
                        </button>
                      ))}
                    </div>

                    {/* Product cards */}
                    {filtered.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-16 rounded-2xl"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <Package2
                          className="h-10 w-10 mb-3"
                          style={{ color: "rgba(255,255,255,0.08)" }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          No products in this category
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((item) => {
                          const gallery = productGalleryImages(item);
                          return (
                            <div
                              key={item.id}
                              className="relative group rounded-2xl overflow-hidden flex flex-col"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              {/* Top accent */}
                              <div
                                className="absolute top-0 left-0 right-0 h-0.5"
                                style={{
                                  background:
                                    "linear-gradient(90deg, rgba(226,232,240,0.45), transparent)",
                                }}
                              />

                              {/* Image */}
                              <div
                                className="relative overflow-hidden"
                                style={{ height: 160 }}
                              >
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {gallery.length > 1 && (
                                  <div
                                    className="absolute bottom-2 right-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                                    style={{
                                      background: "rgba(0,0,0,0.65)",
                                      color: "rgba(255,255,255,0.7)",
                                    }}
                                  >
                                    +{gallery.length - 1}
                                  </div>
                                )}
                                <div
                                  className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                  style={{
                                    background: "rgba(0,0,0,0.6)",
                                    color: "rgba(255,255,255,0.6)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }}
                                >
                                  {item.category}
                                </div>
                              </div>

                              {/* Body */}
                              <div className="flex-1 p-4 space-y-1">
                                <p className="text-sm font-bold text-white leading-tight">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p
                                    className="text-xs leading-relaxed line-clamp-2"
                                    style={{ color: "rgba(255,255,255,0.38)" }}
                                  >
                                    {item.description}
                                  </p>
                                )}
                                <p
                                  className="text-lg font-black tabular-nums pt-1"
                                  style={{ color: "#e2e8f0" }}
                                >
                                  {formatRs(item.price)}
                                </p>
                              </div>

                              {/* Footer actions */}
                              <div
                                className="flex items-center gap-2 px-4 py-3"
                                style={{
                                  borderTop: "1px solid rgba(255,255,255,0.06)",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => selectProductForEdit(item)}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold flex-1 justify-center transition-all"
                                  style={{
                                    background: "rgba(226,232,240,0.1)",
                                    border: "1px solid rgba(226,232,240,0.2)",
                                    color: "#e2e8f0",
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductId(item.id);
                                    setEditingProductId(item.id);
                                    setProductForm(formFromProduct(item));
                                    handleProductDelete();
                                  }}
                                  className="flex items-center justify-center rounded-lg p-2 transition-all"
                                  style={{
                                    background: "rgba(248,113,113,0.08)",
                                    border: "1px solid rgba(248,113,113,0.18)",
                                    color: "#f87171",
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </>
        )}

        {section === "orders" &&
          (() => {
            const viewingOrder =
              orders.find((o) => o.id === viewingOrderId) ?? null;
            const matchedProduct = (ord: AdminOrder | null) =>
              ord
                ? (products.find(
                    (p) =>
                      p.name.toLowerCase() === ord.productName.toLowerCase(),
                  ) ?? null)
                : null;

            const statusMeta: Record<
              AdminOrder["status"],
              { color: string; bg: string; border: string }
            > = {
              New: {
                color: "#e2e8f0",
                bg: "rgba(226,232,240,0.1)",
                border: "rgba(226,232,240,0.25)",
              },
              Contacted: {
                color: "#fbbf24",
                bg: "rgba(251,191,36,0.1)",
                border: "rgba(251,191,36,0.25)",
              },
              Dispatched: {
                color: "#60a5fa",
                bg: "rgba(96,165,250,0.1)",
                border: "rgba(96,165,250,0.25)",
              },
              Delivered: {
                color: "#34d399",
                bg: "rgba(52,211,153,0.1)",
                border: "rgba(52,211,153,0.25)",
              },
            };

            const emptyForm: AdminOrder = {
              id: "",
              customer: "",
              phone: "",
              address: "",
              productName: "",
              amount: 0,
              payment: "COD",
              status: "New",
              notes: "",
              createdAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            };

            return (
              <>
                {/* ── View Order Modal ── */}
                {viewingOrder &&
                  createPortal(
                    <div
                      className="fixed inset-0 flex items-center justify-center p-4"
                      style={{ background: "rgba(0,0,0,0.8)", zIndex: 9999 }}
                      onClick={() => setViewingOrderId(null)}
                    >
                      <div
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-card"
                        style={{
                          maxHeight: "90vh",
                          overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-0.5"
                          style={{
                            background:
                              "linear-gradient(90deg, #e2e8f0, #475569, transparent)",
                          }}
                        />
                        <div
                          className="flex items-center justify-between px-6 py-4"
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <div>
                            <p className="text-sm font-bold text-white">
                              Order Detail
                            </p>
                            <p
                              className="text-[11px] font-mono mt-0.5"
                              style={{ color: "#e2e8f0" }}
                            >
                              {viewingOrder.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOrder(viewingOrder);
                                setViewingOrderId(null);
                              }}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                              style={{
                                background: "rgba(226,232,240,0.1)",
                                border: "1px solid rgba(226,232,240,0.25)",
                                color: "#e2e8f0",
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingOrderId(null)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.5)",
                              }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          {/* Product */}
                          <div className="flex gap-5 items-start">
                            <div
                              className="rounded-xl overflow-hidden shrink-0"
                              style={{
                                width: 120,
                                height: 120,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              {matchedProduct(viewingOrder) ? (
                                <img
                                  src={matchedProduct(viewingOrder)!.image}
                                  alt={viewingOrder.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag
                                    className="h-8 w-8"
                                    style={{ color: "rgba(255,255,255,0.15)" }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold text-white leading-tight">
                                {viewingOrder.productName}
                              </p>
                              {matchedProduct(viewingOrder) && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: "rgba(255,255,255,0.4)" }}
                                >
                                  {matchedProduct(viewingOrder)!.category}
                                </p>
                              )}
                              <p
                                className="text-2xl font-black mt-2 tabular-nums"
                                style={{ color: "#e2e8f0" }}
                              >
                                {formatRs(viewingOrder.amount)}
                              </p>
                              {matchedProduct(viewingOrder)?.description && (
                                <p
                                  className="text-xs mt-2 leading-relaxed line-clamp-2"
                                  style={{ color: "rgba(255,255,255,0.38)" }}
                                >
                                  {matchedProduct(viewingOrder)!.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.07)",
                            }}
                          />
                          {/* Customer */}
                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3"
                              style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                              Customer Details
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div
                                className="rounded-xl p-3.5"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                                  style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                  Name
                                </p>
                                <p className="text-sm font-semibold text-white">
                                  {viewingOrder.customer}
                                </p>
                              </div>
                              <div
                                className="rounded-xl p-3.5"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                                  style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                  Phone
                                </p>
                                <a
                                  href={`tel:${viewingOrder.phone}`}
                                  className="text-sm font-semibold hover:underline"
                                  style={{ color: "#60a5fa" }}
                                >
                                  {viewingOrder.phone}
                                </a>
                              </div>
                              <div
                                className="rounded-xl p-3.5 col-span-2"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                                  style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                  Delivery Address
                                </p>
                                <p className="text-sm font-semibold text-white">
                                  {viewingOrder.address || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Order info */}
                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3"
                              style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                              Order Details
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {(
                                [
                                  {
                                    label: "Order ID",
                                    val: viewingOrder.id,
                                    mono: true,
                                    accent: "rgba(255,255,255,0.7)",
                                  },
                                  {
                                    label: "Payment",
                                    val: viewingOrder.payment,
                                    mono: false,
                                    accent: "white",
                                  },
                                  {
                                    label: "Amount",
                                    val: formatRs(viewingOrder.amount),
                                    mono: false,
                                    accent: "#e2e8f0",
                                  },
                                  {
                                    label: "Placed On",
                                    val: viewingOrder.createdAt || "—",
                                    mono: false,
                                    accent: "white",
                                  },
                                ] as {
                                  label: string;
                                  val: string;
                                  mono: boolean;
                                  accent: string;
                                }[]
                              ).map((f) => (
                                <div
                                  key={f.label}
                                  className="rounded-xl p-3.5"
                                  style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                  }}
                                >
                                  <p
                                    className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1"
                                    style={{ color: "rgba(255,255,255,0.3)" }}
                                  >
                                    {f.label}
                                  </p>
                                  <p
                                    className={`text-sm font-semibold ${f.mono ? "font-mono" : ""}`}
                                    style={{ color: f.accent }}
                                  >
                                    {f.val}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          {viewingOrder.notes && (
                            <div>
                              <p
                                className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2"
                                style={{ color: "rgba(255,255,255,0.3)" }}
                              >
                                Notes
                              </p>
                              <div
                                className="rounded-xl p-3.5"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                }}
                              >
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{ color: "rgba(255,255,255,0.65)" }}
                                >
                                  {viewingOrder.notes}
                                </p>
                              </div>
                            </div>
                          )}
                          {matchedProduct(viewingOrder) &&
                            matchedProduct(viewingOrder)!.specs.length > 0 && (
                              <div>
                                <p
                                  className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3"
                                  style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                  Product Specs
                                </p>
                                <div
                                  className="rounded-xl overflow-hidden"
                                  style={{
                                    border: "1px solid rgba(255,255,255,0.07)",
                                  }}
                                >
                                  {matchedProduct(viewingOrder)!.specs.map(
                                    (spec, i, arr) => (
                                      <div
                                        key={spec.label}
                                        className="flex items-center justify-between px-4 py-2.5"
                                        style={{
                                          borderBottom:
                                            i < arr.length - 1
                                              ? "1px solid rgba(255,255,255,0.05)"
                                              : "none",
                                          background:
                                            i % 2 === 0
                                              ? "rgba(255,255,255,0.02)"
                                              : "transparent",
                                        }}
                                      >
                                        <span
                                          className="text-xs"
                                          style={{
                                            color: "rgba(255,255,255,0.4)",
                                          }}
                                        >
                                          {spec.label}
                                        </span>
                                        <span className="text-xs font-semibold text-white">
                                          {spec.value}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          <div
                            className="flex items-center justify-between gap-3 flex-wrap pt-5"
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <p
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                              >
                                Status:
                              </p>
                              <select
                                value={viewingOrder.status}
                                onChange={async (e) => {
                                  const next = e.target
                                    .value as AdminOrder["status"];
                                  try {
                                    const updated = await updateOrderApi(
                                      viewingOrder.id,
                                      { status: next },
                                    );
                                    setOrders((prev) =>
                                      prev.map((item) =>
                                        item.id === viewingOrder.id
                                          ? {
                                              ...item,
                                              ...updated,
                                              address: item.address,
                                            }
                                          : item,
                                      ),
                                    );
                                    toast.success(`Status → ${next}`);
                                  } catch (err) {
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Failed to update order status",
                                    );
                                  }
                                }}
                                className="rounded-full text-xs font-bold px-3 py-1.5 cursor-pointer outline-none appearance-none"
                                style={{
                                  background:
                                    statusMeta[viewingOrder.status].bg,
                                  color: statusMeta[viewingOrder.status].color,
                                  border: `1px solid ${statusMeta[viewingOrder.status].border}`,
                                }}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await deleteOrderApi(viewingOrder.id);
                                  setOrders((prev) =>
                                    prev.filter(
                                      (item) => item.id !== viewingOrder.id,
                                    ),
                                  );
                                  setViewingOrderId(null);
                                  toast.success("Order deleted.");
                                } catch (err) {
                                  toast.error(
                                    err instanceof Error
                                      ? err.message
                                      : "Failed to delete order",
                                  );
                                }
                              }}
                              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold"
                              style={{
                                background: "rgba(248,113,113,0.1)",
                                border: "1px solid rgba(248,113,113,0.25)",
                                color: "#f87171",
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>,
                    document.body,
                  )}

                {/* ── Add / Edit Order Modal ── */}
                {editingOrder !== null &&
                  createPortal(
                    <div
                      className="fixed inset-0 flex items-center justify-center p-4"
                      style={{ background: "rgba(0,0,0,0.8)", zIndex: 9999 }}
                      onClick={() => setEditingOrder(null)}
                    >
                      <div
                        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-card"
                        style={{
                          maxHeight: "92vh",
                          overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-0.5"
                          style={{
                            background:
                              "linear-gradient(90deg, #e2e8f0, #475569, transparent)",
                          }}
                        />
                        <div
                          className="flex items-center justify-between px-6 py-4"
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <p className="text-sm font-bold text-white">
                            {editingOrder.id ? "Edit Order" : "New Order"}
                          </p>
                          <button
                            type="button"
                            onClick={() => setEditingOrder(null)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <form
                          className="p-6 space-y-4"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (
                              !editingOrder.customer.trim() ||
                              !editingOrder.phone.trim() ||
                              !editingOrder.productName.trim()
                            ) {
                              toast.error(
                                "Customer, phone and product are required.",
                              );
                              return;
                            }
                            try {
                              if (editingOrder.id) {
                                const updated = await updateOrderApi(
                                  editingOrder.id,
                                  {
                                    customer: editingOrder.customer,
                                    phone: editingOrder.phone,
                                    address: editingOrder.address,
                                    productName: editingOrder.productName,
                                    amount: editingOrder.amount,
                                    payment: editingOrder.payment,
                                    status: editingOrder.status,
                                    notes: editingOrder.notes ?? "",
                                  },
                                );
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === editingOrder.id
                                      ? {
                                          ...o,
                                          ...updated,
                                          address: editingOrder.address,
                                        }
                                      : o,
                                  ),
                                );
                                toast.success("Order updated.");
                              } else {
                                const newId = `ORD-${Date.now()}`;
                                const created = await createOrderApi({
                                  id: newId,
                                  customer: editingOrder.customer,
                                  phone: editingOrder.phone,
                                  address: editingOrder.address,
                                  productName: editingOrder.productName,
                                  amount: editingOrder.amount,
                                  payment: editingOrder.payment,
                                  notes: editingOrder.notes ?? "",
                                });
                                setOrders((prev) => [
                                  { ...created, address: editingOrder.address },
                                  ...prev,
                                ]);
                                toast.success("Order added.");
                              }
                              setEditingOrder(null);
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to save order",
                              );
                            }
                          }}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.55)" }}
                              >
                                Customer Name *
                              </Label>
                              <Input
                                value={editingOrder.customer}
                                onChange={(e) =>
                                  setEditingOrder({
                                    ...editingOrder,
                                    customer: e.target.value,
                                  })
                                }
                                placeholder="Full name"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.55)" }}
                              >
                                Phone *
                              </Label>
                              <Input
                                value={editingOrder.phone}
                                onChange={(e) =>
                                  setEditingOrder({
                                    ...editingOrder,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="98XXXXXXXX"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{ color: "rgba(255,255,255,0.55)" }}
                            >
                              Delivery Address
                            </Label>
                            <Input
                              value={editingOrder.address}
                              onChange={(e) =>
                                setEditingOrder({
                                  ...editingOrder,
                                  address: e.target.value,
                                })
                              }
                              placeholder="Street, City"
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.55)" }}
                              >
                                Product *
                              </Label>
                              <Input
                                value={editingOrder.productName}
                                onChange={(e) =>
                                  setEditingOrder({
                                    ...editingOrder,
                                    productName: e.target.value,
                                  })
                                }
                                placeholder="Product name"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.55)" }}
                              >
                                Amount (NPR) *
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={editingOrder.amount || ""}
                                onChange={(e) =>
                                  setEditingOrder({
                                    ...editingOrder,
                                    amount: Number(e.target.value),
                                  })
                                }
                                placeholder="0"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.55)" }}
                              >
                                Payment
                              </Label>
                              <select
                                value={editingOrder.payment}
                                onChange={(e) =>
                                  setEditingOrder({
                                    ...editingOrder,
                                    payment: e.target
                                      .value as AdminOrder["payment"],
                                  })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none cursor-pointer"
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "white",
                                }}
                              >
                                <option value="COD">COD</option>
                                <option value="Prepayment">Prepayment</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                className="text-xs font-semibold"
                                style={{ color: "rgba(255,255,255,0.55)" }}
                              >
                                Status
                              </Label>
                              <select
                                value={editingOrder.status}
                                onChange={(e) =>
                                  setEditingOrder({
                                    ...editingOrder,
                                    status: e.target
                                      .value as AdminOrder["status"],
                                  })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none cursor-pointer"
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "white",
                                }}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{ color: "rgba(255,255,255,0.55)" }}
                            >
                              Notes
                            </Label>
                            <Textarea
                              value={editingOrder.notes ?? ""}
                              onChange={(e) =>
                                setEditingOrder({
                                  ...editingOrder,
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Any special instructions…"
                              rows={3}
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50 resize-none"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingOrder(null)}
                              className="rounded-lg px-4 py-2 text-sm font-semibold"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.55)",
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
                              style={{
                                background: "rgba(148,163,184,0.8)",
                                border: "1px solid rgba(148,163,184,0.9)",
                                color: "white",
                              }}
                            >
                              <Save className="h-3.5 w-3.5" />
                              {editingOrder.id ? "Save Changes" : "Add Order"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>,
                    document.body,
                  )}

                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Order Management
                      </h1>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Track and manage Buy Now orders
                      </p>
                      {ordersLoading && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          Loading latest orders...
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingOrder({ ...emptyForm })}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background: "rgba(148,163,184,0.18)",
                        border: "1px solid rgba(148,163,184,0.4)",
                        color: "#f8fafc",
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add New Order
                    </button>
                  </div>

                  {/* Stats strip */}
                  {(() => {
                    const counts = {
                      New: orders.filter((o) => o.status === "New").length,
                      Contacted: orders.filter((o) => o.status === "Contacted")
                        .length,
                      Dispatched: orders.filter(
                        (o) => o.status === "Dispatched",
                      ).length,
                      Delivered: orders.filter((o) => o.status === "Delivered")
                        .length,
                    };
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {(
                          [
                            {
                              label: "Total",
                              value: orders.length,
                              accent: "#e2e8f0",
                            },
                            {
                              label: "New",
                              value: counts.New,
                              accent: "#e2e8f0",
                            },
                            {
                              label: "Contacted",
                              value: counts.Contacted,
                              accent: "#fbbf24",
                            },
                            {
                              label: "Dispatched",
                              value: counts.Dispatched,
                              accent: "#60a5fa",
                            },
                            {
                              label: "Delivered",
                              value: counts.Delivered,
                              accent: "#34d399",
                            },
                          ] as {
                            label: string;
                            value: number;
                            accent: string;
                          }[]
                        ).map((s) => (
                          <div
                            key={s.label}
                            className="rounded-xl p-4"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            <p
                              className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5"
                              style={{ color: "rgba(255,255,255,0.35)" }}
                            >
                              {s.label}
                            </p>
                            <p
                              className="text-2xl font-bold tabular-nums"
                              style={{ color: s.accent }}
                            >
                              {s.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Orders table */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        All Orders · {orders.length}
                      </p>
                    </div>
                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ShoppingBag
                          className="h-10 w-10 mb-3"
                          style={{ color: "rgba(255,255,255,0.1)" }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          No orders yet
                        </p>
                        <p
                          className="text-xs mt-1 mb-4"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                        >
                          Orders placed via the store will appear here
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingOrder({ ...emptyForm })}
                          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
                          style={{
                            background: "rgba(148,163,184,0.2)",
                            border: "1px solid rgba(148,163,184,0.4)",
                            color: "#f8fafc",
                          }}
                        >
                          <Plus className="h-4 w-4" /> Add First Order
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full" style={{ minWidth: 700 }}>
                          <thead>
                            <tr
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              {[
                                "SN",
                                "Order ID",
                                "Customer",
                                "Item",
                                "Amount",
                                "Payment",
                                "Status",
                                "",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em]"
                                  style={{ color: "rgba(255,255,255,0.28)" }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((o, idx) => {
                              const sm = statusMeta[o.status];
                              return (
                                <tr
                                  key={o.id}
                                  className="transition-all"
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.04)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.03)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "";
                                  }}
                                >
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className="text-xs font-bold tabular-nums"
                                      style={{ color: "rgba(255,255,255,0.3)" }}
                                    >
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className="font-mono text-xs font-semibold"
                                      style={{ color: "rgba(255,255,255,0.5)" }}
                                    >
                                      {o.id}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-white">
                                      {o.customer}
                                    </p>
                                    <a
                                      href={`tel:${o.phone}`}
                                      className="flex items-center gap-1 text-[11px] mt-0.5 hover:underline"
                                      style={{ color: "rgba(255,255,255,0.4)" }}
                                    >
                                      <Phone className="h-3 w-3" />
                                      {o.phone}
                                    </a>
                                    {o.address && (
                                      <p
                                        className="flex items-center gap-1 text-[11px] mt-0.5 truncate max-w-[140px]"
                                        style={{
                                          color: "rgba(255,255,255,0.28)",
                                        }}
                                      >
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        {o.address}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <p
                                      className="text-sm text-white max-w-[150px] truncate"
                                      title={o.productName}
                                    >
                                      {o.productName}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-bold tabular-nums text-white">
                                      {formatRs(o.amount)}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                      style={{
                                        background:
                                          o.payment === "Prepayment"
                                            ? "rgba(52,211,153,0.1)"
                                            : "rgba(255,255,255,0.06)",
                                        color:
                                          o.payment === "Prepayment"
                                            ? "#34d399"
                                            : "rgba(255,255,255,0.5)",
                                        border: `1px solid ${o.payment === "Prepayment" ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)"}`,
                                      }}
                                    >
                                      {o.payment}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <select
                                      value={o.status}
                                      onChange={async (e) => {
                                        const next = e.target
                                          .value as AdminOrder["status"];
                                        try {
                                          const updated = await updateOrderApi(
                                            o.id,
                                            { status: next },
                                          );
                                          setOrders((prev) =>
                                            prev.map((item) =>
                                              item.id === o.id
                                                ? {
                                                    ...item,
                                                    ...updated,
                                                    address: item.address,
                                                  }
                                                : item,
                                            ),
                                          );
                                          toast.success(`Status → ${next}`);
                                        } catch (err) {
                                          toast.error(
                                            err instanceof Error
                                              ? err.message
                                              : "Failed to update order status",
                                          );
                                        }
                                      }}
                                      className="rounded-full text-xs font-bold px-2.5 py-1 cursor-pointer outline-none transition-all appearance-none"
                                      style={{
                                        background: sm.bg,
                                        color: sm.color,
                                        border: `1px solid ${sm.border}`,
                                      }}
                                    >
                                      <option value="New">New</option>
                                      <option value="Contacted">
                                        Contacted
                                      </option>
                                      <option value="Dispatched">
                                        Dispatched
                                      </option>
                                      <option value="Delivered">
                                        Delivered
                                      </option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setViewingOrderId(o.id)}
                                        title="View"
                                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
                                        style={{
                                          background: "rgba(96,165,250,0.1)",
                                          border:
                                            "1px solid rgba(96,165,250,0.2)",
                                          color: "#60a5fa",
                                        }}
                                      >
                                        <Eye className="h-3.5 w-3.5" /> View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingOrder(o)}
                                        title="Edit"
                                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
                                        style={{
                                          background: "rgba(226,232,240,0.1)",
                                          border:
                                            "1px solid rgba(226,232,240,0.2)",
                                          color: "#e2e8f0",
                                        }}
                                      >
                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            await deleteOrderApi(o.id);
                                            setOrders((prev) =>
                                              prev.filter(
                                                (item) => item.id !== o.id,
                                              ),
                                            );
                                            toast.success("Order deleted.");
                                          } catch (err) {
                                            toast.error(
                                              err instanceof Error
                                                ? err.message
                                                : "Failed to delete order",
                                            );
                                          }
                                        }}
                                        title="Delete"
                                        className="flex items-center justify-center rounded-lg p-1.5"
                                        style={{
                                          background: "rgba(248,113,113,0.08)",
                                          border:
                                            "1px solid rgba(248,113,113,0.18)",
                                          color: "#f87171",
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
      </div>
    </AdminShell>
  );
}
