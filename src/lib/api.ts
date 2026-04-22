import { normalizeBookingYmd, type Booking } from "@/lib/bookingStore";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const ADMIN_TOKEN_KEY = "jamspace-admin-token";
/** Set with admin login so /book/* routes allow access without re-entering password. */
export const BOOK_ACCESS_KEY = "jamspace-book-auth";

const AUTH_LOST_EVENT = "jamspace-admin-auth-lost";

function migrateKeyFromSessionToLocal(key: string) {
  if (typeof window === "undefined") return;
  try {
    const legacy = sessionStorage.getItem(key);
    if (legacy != null && legacy !== "") {
      if (!localStorage.getItem(key)) localStorage.setItem(key, legacy);
      sessionStorage.removeItem(key);
    }
  } catch {
    /* storage blocked */
  }
}

/** JWT persists across reload, new tabs, and browser restarts (until logout or 401). */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  migrateKeyFromSessionToLocal(ADMIN_TOKEN_KEY);
  try {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY)?.trim();
    return t || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    /* quota / private mode */
  }
}

/** Optional flag stored with login (same persistence as the token). */
export function setBookRouteAccess(granted: boolean) {
  if (typeof window === "undefined") return;
  try {
    migrateKeyFromSessionToLocal(BOOK_ACCESS_KEY);
    if (granted) {
      localStorage.setItem(BOOK_ACCESS_KEY, "1");
      sessionStorage.removeItem(BOOK_ACCESS_KEY);
    } else {
      localStorage.removeItem(BOOK_ACCESS_KEY);
      sessionStorage.removeItem(BOOK_ACCESS_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Clears admin session when the API returns 401 (bad signature, wrong secret, malformed token, etc.). */
export function clearAdminSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(BOOK_ACCESS_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(BOOK_ACCESS_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(AUTH_LOST_EVENT));
}

export function onAdminAuthLost(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_LOST_EVENT, handler);
  return () => window.removeEventListener(AUTH_LOST_EVENT, handler);
}

async function throwIfBadAuth(res: Response) {
  if (res.status !== 401) return;
  clearAdminSession();
  throw new Error(
    "Session is no longer valid (for example the server secret changed) — please log in again.",
  );
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j?.error && typeof j.error === "string") return j.error;
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

function normalizeBooking(raw: Record<string, unknown>): Booking {
  const bandName = raw.bandName ?? raw.band_name;
  const contact = raw.contactDetails ?? raw.contact_details;
  return {
    id: String(raw.id ?? ""),
    room: Number(raw.room) as 1 | 2,
    date: normalizeBookingYmd(String(raw.date ?? "")),
    hour: Number(raw.hour),
    bandName: typeof bandName === "string" ? bandName : String(bandName ?? ""),
    contactDetails:
      contact == null || contact === "" ? null : typeof contact === "string" ? contact : String(contact),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
  };
}



export type StoreOrder = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  productName: string;
  amount: number;
  payment: "COD" | "Prepayment";
  status: "New" | "Contacted" | "Dispatched" | "Delivered";
  notes?: string;
  createdAt?: string;
};

function normalizeOrder(raw: Record<string, unknown>): StoreOrder {
  return {
    id: String(raw.id ?? ""),
    customer: String(raw.customer ?? ""),
    phone: String(raw.phone ?? ""),
    address: String(raw.address ?? ""),
    productName: String(raw.productName ?? raw.product_name ?? ""),
    amount: Number(raw.amount ?? 0),
    payment: (String(raw.payment ?? "COD") as StoreOrder["payment"]) || "COD",
    status: (String(raw.status ?? "New") as StoreOrder["status"]) || "New",
    notes: raw.notes == null ? "" : String(raw.notes),
    createdAt: raw.createdAt == null ? "" : String(raw.createdAt),
  };
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/api/bookings`, { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((b) => normalizeBooking(b as Record<string, unknown>));
}

export async function apiLogin(password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

function authHeaders(): HeadersInit {
  const t = getStoredToken();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function createBookingApi(payload: {
  room: 1 | 2;
  date: string;
  hour: number;
  bandName: string;
  contactDetails?: string | null;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateBookingApi(
  id: string,
  payload: Partial<{
    room: 1 | 2;
    date: string;
    hour: number;
    bandName: string;
    contactDetails: string | null;
  }>,
): Promise<Booking> {
  const res = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteBookingApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 204) return;
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
}

export async function fetchOrdersApi(): Promise<StoreOrder[]> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((o) => normalizeOrder(o as Record<string, unknown>));
}

export async function createOrderApi(payload: {
  id: string;
  customer: string;
  phone: string;
  address?: string;
  productName: string;
  amount: number;
  payment: "COD" | "Prepayment";
  notes?: string;
}): Promise<StoreOrder> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
  return normalizeOrder((await res.json()) as Record<string, unknown>);
}

export async function updateOrderApi(
  id: string,
  payload: Partial<{
    customer: string;
    phone: string;
    address: string;
    productName: string;
    amount: number;
    payment: "COD" | "Prepayment";
    status: "New" | "Contacted" | "Dispatched" | "Delivered";
    notes: string;
  }>,
): Promise<StoreOrder> {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
  return normalizeOrder((await res.json()) as Record<string, unknown>);
}

export async function deleteOrderApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 204) return;
  await throwIfBadAuth(res);
  if (!res.ok) throw new Error(await parseError(res));
}
