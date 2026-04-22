export interface Booking {
  id: string;
  room: 1 | 2;
  date: string; // YYYY-MM-DD
  hour: number; // 6-20
  bandName: string;
  contactDetails?: string | null;
  createdAt: string;
}

export interface Room {
  id: 1 | 2;
  name: string;
  price: number;
}

export const ROOMS: Room[] = [
  { id: 1, name: "Room 1 (big room)", price: 500 },
  { id: 2, name: "Room 2 (small room)", price: 350 },
];

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 6); // 6-20 (6 AM to 9 PM)

/** All calendar boundaries (day, week, month) use this zone. Week = Sun–Sat; new week starts Sunday 12:00 AM after Saturday 11:59:59 PM. */
export const KATHMANDU_TZ = "Asia/Kathmandu";

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** YYYY-MM-DD in Kathmandu for the given instant. */
export function getYmdInKathmandu(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KATHMANDU_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Local clock hour (0–23) in Kathmandu. */
export function getHourInKathmandu(d: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: KATHMANDU_TZ,
    hour: "numeric",
    hour12: false,
  })
    .formatToParts(d)
    .find((p) => p.type === "hour")?.value;
  return hour !== undefined ? parseInt(hour, 10) : 0;
}

export function addDaysToYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d + deltaDays);
  const dt = new Date(t);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Weekday label (e.g. Mon) for a Kathmandu calendar YYYY-MM-DD. */
function getWeekdayShortForYmdInKathmandu(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T12:00:00+05:45`;
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: KATHMANDU_TZ,
    weekday: "short",
  }).format(dt);
}

/** 0 = Sunday … 6 = Saturday (Kathmandu calendar day of `d`). */
function getWeekday0SunKathmandu(d: Date = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: KATHMANDU_TZ,
    weekday: "short",
  }).format(d);
  return WEEKDAY_SHORT_TO_INDEX[wd] ?? 0;
}

/** The seven YYYY-MM-DD strings for the Kathmandu week (Sun → Sat) containing `d`. */
export function getKathmanduWeekYmds(d: Date = new Date()): string[] {
  const todayKtm = getYmdInKathmandu(d);
  const weekday = getWeekday0SunKathmandu(d);
  const sunday = addDaysToYmd(todayKtm, -weekday);
  return Array.from({ length: 7 }, (_, i) => addDaysToYmd(sunday, i));
}

export function getBookingsForDate(bookings: Booking[], date: string): Booking[] {
  return bookings.filter((b) => b.date === date);
}

export function getBooking(
  bookings: Booking[],
  room: number,
  date: string,
  hour: number,
): Booking | undefined {
  return bookings.find(
    (b) => Number(b.room) === Number(room) && b.date === date && Number(b.hour) === Number(hour),
  );
}

/** Nepal standard time offset (no DST). Slot times are interpreted on the booking’s calendar day. */
const NPT_OFFSET = "+05:45";

/**
 * End of slot `hour`–`hour+1` in NPT on `booking.date` (instant when revenue is counted).
 * Example: hour 16 (4–5 PM) counts only after 17:00 NPT that day.
 */
export function bookingSlotEndInstant(booking: Booking): Date | null {
  const ymd = normalizeBookingYmd(booking.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const h = Number(booking.hour);
  if (!Number.isFinite(h)) return null;
  const endH = h + 1;
  if (endH < 0 || endH > 24) return null;
  const [y, mo, d] = ymd.split("-").map(Number);
  const iso = `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(endH).padStart(2, "0")}:00:00${NPT_OFFSET}`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : new Date(t);
}

/** Whether this booking’s time slot has finished in real time (revenue “earned”). */
export function isBookingRevenueEarned(booking: Booking, now: Date = new Date()): boolean {
  const end = bookingSlotEndInstant(booking);
  if (!end) return false;
  return now.getTime() >= end.getTime();
}

function bookingEarnedPrice(booking: Booking, now: Date): number {
  if (!isBookingRevenueEarned(booking, now)) return 0;
  const room = ROOMS.find((r) => r.id === booking.room);
  return room?.price ?? 0;
}

/** Sum earned revenue for one calendar day (`date` = YYYY-MM-DD). Only slots that have ended by `now` count. */
export function getDailyEarnings(bookings: Booking[], date: string, now: Date = new Date()): number {
  return getBookingsForDate(bookings, date).reduce((sum, b) => sum + bookingEarnedPrice(b, now), 0);
}

/** Sum of **earned** revenue for the Kathmandu calendar month containing `now`. */
export function getMonthlyEarnings(bookings: Booking[], d: Date = new Date()): number {
  const ymd = getYmdInKathmandu(d);
  const ym = ymd.slice(0, 7);
  return bookings
    .filter((b) => b.date.startsWith(`${ym}-`))
    .reduce((sum, b) => sum + bookingEarnedPrice(b, d), 0);
}

export function getKathmanduWeekEarnings(bookings: Booking[], d: Date = new Date()): number {
  return getKathmanduWeekYmds(d).reduce((sum, ymd) => sum + getDailyEarnings(bookings, ymd, d), 0);
}

export function formatRs(amount: number): string {
  return `Rs. ${amount}`;
}

export function formatHour(hour: number): string {
  const h = hour % 12 || 12;
  return `${h}:00`;
}

export function formatHourRange(hour: number): string {
  const start = hour % 12 || 12;
  const end = (hour + 1) % 12 || 12;
  return `${start}:00–${end}:00`;
}

/** Default: today (Kathmandu) + 7 days after = 8 schedule columns. */
export const DEFAULT_SCHEDULE_DAYS_AFTER_TODAY = 7;

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** One schedule column for a Kathmandu calendar YYYY-MM-DD. */
export function getDateColumnMeta(
  dateStr: string,
  now: Date = new Date(),
): { date: string; label: string; dayName: string; isToday: boolean } {
  const todayKtm = getYmdInKathmandu(now);
  const [, m, dayNum] = dateStr.split("-").map(Number);
  return {
    date: dateStr,
    label: `${MONTHS_SHORT[m - 1]} ${dayNum}`,
    dayName: getWeekdayShortForYmdInKathmandu(dateStr),
    isToday: dateStr === todayKtm,
  };
}

/**
 * Schedule columns: Kathmandu **today** first, then the next `extraDaysAfterToday` calendar days
 * (default 7 → 8 columns: today + 7 upcoming). “Today” follows the Kathmandu calendar: it advances
 * at 00:00 NPT (right after 23:59:59). Use `useKathmanduDayKey` in the UI so columns refresh at rollover.
 */
export function getDates(
  extraDaysAfterToday: number = DEFAULT_SCHEDULE_DAYS_AFTER_TODAY,
  now: Date = new Date(),
): {
  date: string;
  label: string;
  dayName: string;
  isToday: boolean;
}[] {
  const todayKtm = getYmdInKathmandu(now);
  const ymds: string[] = [];
  for (let i = 0; i <= extraDaysAfterToday; i++) {
    ymds.push(addDaysToYmd(todayKtm, i));
  }
  return ymds.map((dateStr) => getDateColumnMeta(dateStr, now));
}

/**
 * Rolling window from `getDates` **plus** every booking date for `roomId` so DB rows always appear
 * (bookings outside “today + 7” were invisible before).
 */
export function getScheduleDatesForRoom(
  bookings: Booking[],
  roomId: number,
  extraDaysAfterToday: number = DEFAULT_SCHEDULE_DAYS_AFTER_TODAY,
  now: Date = new Date(),
): { date: string; label: string; dayName: string; isToday: boolean }[] {
  const base = getDates(extraDaysAfterToday, now);
  const todayKtm = getYmdInKathmandu(now);
  const set = new Set(base.map((r) => r.date));
  for (const b of bookings) {
    if (Number(b.room) !== Number(roomId)) continue;
    const ymd = normalizeBookingYmd(b.date);
    // Keep schedule forward-looking only: today and future dates.
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd) && ymd >= todayKtm) set.add(ymd);
  }
  return Array.from(set)
    .sort()
    .map((d) => getDateColumnMeta(d, now));
}

/** Inclusive YYYY-MM-DD range: Kathmandu today through today + extraDaysAfterToday (same as base schedule columns). */
export function getScheduleWindowYmdRange(
  now: Date = new Date(),
  extraDaysAfterToday: number = DEFAULT_SCHEDULE_DAYS_AFTER_TODAY,
): { start: string; end: string } {
  const start = getYmdInKathmandu(now);
  const end = addDaysToYmd(start, extraDaysAfterToday);
  return { start, end };
}

/** Normalize API / DB date to YYYY-MM-DD for comparisons. */
export function normalizeBookingYmd(raw: string | undefined | null): string {
  if (raw == null) return "";
  return String(raw)
    .trim()
    .replace(/T.*/, "")
    .replace(/^(\d{4}-\d{2}-\d{2}).*/, "$1")
    .slice(0, 10);
}

export function daysInCalendarMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function weekday0SunForYmdKathmandu(ymd: string): number {
  const wd = getWeekdayShortForYmdInKathmandu(ymd);
  return WEEKDAY_SHORT_TO_INDEX[wd] ?? 0;
}

/** Current calendar year and month (1–12) in Kathmandu. */
export function getKathmanduYearMonth(now: Date = new Date()): { year: number; month: number } {
  const ymd = getYmdInKathmandu(now);
  const [y, m] = ymd.split("-").map(Number);
  return { year: y, month: m };
}

/** Move by `delta` months (e.g. -1 = previous month). */
export function shiftCalendarMonth(
  year: number,
  month1to12: number,
  delta: number,
): { year: number; month: number } {
  const dt = new Date(Date.UTC(year, month1to12 - 1 + delta, 1));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1 };
}

const MONTH_NAMES_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Metadata to render a standard month grid (Kathmandu weekday for the 1st). */
export function getCalendarMonthMeta(year: number, month1to12: number): {
  year: number;
  month: number;
  monthLabel: string;
  daysInMonth: number;
  firstYmd: string;
  firstWeekday0Sun: number;
} {
  const firstYmd = `${year}-${String(month1to12).padStart(2, "0")}-01`;
  const dim = daysInCalendarMonth(year, month1to12);
  return {
    year,
    month: month1to12,
    monthLabel: `${MONTH_NAMES_LONG[month1to12 - 1]} ${year}`,
    daysInMonth: dim,
    firstYmd,
    firstWeekday0Sun: weekday0SunForYmdKathmandu(firstYmd),
  };
}

/** The calendar month **before** the one containing `now` in Kathmandu (full previous month). */
export function getPreviousKathmanduCalendarMonth(now: Date = new Date()): {
  year: number;
  month: number;
  monthLabel: string;
  daysInMonth: number;
  firstYmd: string;
  firstWeekday0Sun: number;
} {
  const todayYmd = getYmdInKathmandu(now);
  const [cy, cm] = todayYmd.split("-").map(Number);
  const firstThis = `${cy}-${String(cm).padStart(2, "0")}-01`;
  const lastPrev = addDaysToYmd(firstThis, -1);
  const [y, m] = lastPrev.split("-").map(Number);
  const firstYmd = `${y}-${String(m).padStart(2, "0")}-01`;
  const dim = daysInCalendarMonth(y, m);
  return {
    year: y,
    month: m,
    monthLabel: `${MONTH_NAMES_LONG[m - 1]} ${y}`,
    daysInMonth: dim,
    firstYmd,
    firstWeekday0Sun: weekday0SunForYmdKathmandu(firstYmd),
  };
}

/** Last `n` calendar days ending today (Kathmandu), inclusive. */
export function getLastNDaysYmdRangeKathmandu(n: number, now: Date = new Date()): { start: string; end: string } {
  const end = getYmdInKathmandu(now);
  const start = addDaysToYmd(end, -(n - 1));
  return { start, end };
}

export function getDailyEarningsSeries(
  bookings: Booking[],
  startYmd: string,
  endYmd: string,
  now: Date = new Date(),
): { date: string; label: string; amount: number }[] {
  const out: { date: string; label: string; amount: number }[] = [];
  let cur = startYmd;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let guard = 0;
  while (cur <= endYmd && guard++ < 400) {
    const [, mo, day] = cur.split("-").map(Number);
    out.push({
      date: cur,
      label: `${months[mo - 1]} ${day}`,
      amount: getDailyEarnings(bookings, cur, now),
    });
    cur = addDaysToYmd(cur, 1);
  }
  return out;
}

export function getWeekTotalEarningsStartingSunday(
  bookings: Booking[],
  sundayYmd: string,
  now: Date = new Date(),
): number {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += getDailyEarnings(bookings, addDaysToYmd(sundayYmd, i), now);
  }
  return sum;
}

/** Last `numWeeks` Kathmandu weeks (Sun–Sat), oldest first; label is week start m/d. */
export function getWeeklyEarningsSeries(
  bookings: Booking[],
  numWeeks: number,
  now: Date = new Date(),
): { label: string; amount: number }[] {
  const todayKtm = getYmdInKathmandu(now);
  const w = getWeekday0SunKathmandu(now);
  const thisSunday = addDaysToYmd(todayKtm, -w);
  const out: { label: string; amount: number }[] = [];
  for (let k = numWeeks - 1; k >= 0; k--) {
    const sunday = addDaysToYmd(thisSunday, -7 * k);
    const amount = getWeekTotalEarningsStartingSunday(bookings, sunday, now);
    const [, m, d] = sunday.split("-").map(Number);
    out.push({ label: `${m}/${d}`, amount });
  }
  return out;
}

export function getRoomRevenueSplitForCurrentMonth(
  bookings: Booking[],
  now: Date = new Date(),
): { name: string; amount: number }[] {
  const ymd = getYmdInKathmandu(now);
  const ym = ymd.slice(0, 7);
  const list = bookings.filter((b) => b.date.startsWith(`${ym}-`));
  const agg: Record<string, number> = {};
  for (const b of list) {
    const add = bookingEarnedPrice(b, now);
    if (add === 0) continue;
    const room = ROOMS.find((r) => r.id === b.room);
    const name = room?.name ?? `Room ${b.room}`;
    agg[name] = (agg[name] ?? 0) + add;
  }
  return ROOMS.map((r) => ({ name: r.name, amount: agg[r.name] ?? 0 }));
}

export function getBookingsForDateSorted(bookings: Booking[], date: string): Booking[] {
  return [...getBookingsForDate(bookings, date)].sort((a, b) => a.hour - b.hour);
}
