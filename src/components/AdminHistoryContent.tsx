"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Music2, X } from "lucide-react";
import {
  formatHourRange,
  formatRs,
  getBookingsForDateSorted,
  getCalendarMonthMeta,
  getDailyEarnings,
  getKathmanduYearMonth,
  getLastNDaysYmdRangeKathmandu,
  shiftCalendarMonth,
  ROOMS,
} from "@/lib/bookingStore";
import { useKathmanduDayKey } from "@/hooks/useKathmanduDayKey";
import { useRevenueNow } from "@/hooks/useRevenueNow";
import { useBookingsQuery } from "@/hooks/useBookingsQuery";

const WEEK_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthCells(meta: ReturnType<typeof getCalendarMonthMeta>): (string | null)[] {
  const cells: (string | null)[] = [];
  for (let i = 0; i < meta.firstWeekday0Sun; i++) cells.push(null);
  for (let day = 1; day <= meta.daysInMonth; day++) {
    const mm = String(meta.month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    cells.push(`${meta.year}-${mm}-${dd}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AdminHistoryContent() {
  const kathmanduDayKey = useKathmanduDayKey();
  const revenueNow = useRevenueNow();
  const { data: bookings = [] } = useBookingsQuery();
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null);
  const [view, setView] = useState(() => getKathmanduYearMonth());

  const todayYm = useMemo(() => {
    void kathmanduDayKey;
    return getKathmanduYearMonth();
  }, [kathmanduDayKey]);

  const meta = useMemo(() => getCalendarMonthMeta(view.year, view.month), [view.year, view.month]);
  const cells = useMemo(() => buildMonthCells(meta), [meta]);

  const last30 = useMemo(() => {
    void kathmanduDayKey;
    return getLastNDaysYmdRangeKathmandu(30);
  }, [kathmanduDayKey]);

  const canGoNext = view.year < todayYm.year || (view.year === todayYm.year && view.month < todayYm.month);

  const dayBookings = useMemo(
    () => (selectedYmd ? getBookingsForDateSorted(bookings, selectedYmd) : []),
    [selectedYmd, bookings],
  );

  const dayTotal = selectedYmd ? getDailyEarnings(bookings, selectedYmd, revenueNow) : 0;

  const goPrev = () => { setView((v) => shiftCalendarMonth(v.year, v.month, -1)); setSelectedYmd(null); };
  const goNext = () => { if (!canGoNext) return; setView((v) => shiftCalendarMonth(v.year, v.month, 1)); setSelectedYmd(null); };
  const goTodayMonth = () => { setView(todayYm); setSelectedYmd(null); };

  // Compute month total for display
  const monthTotal = useMemo(() => {
    void kathmanduDayKey;
    const prefix = `${String(view.year)}-${String(view.month).padStart(2, "0")}-`;
    return bookings
      .filter((b) => b.date.startsWith(prefix))
      .reduce((sum, b) => {
        const room = ROOMS.find((r) => r.id === b.room);
        return sum + (room?.price ?? 0);
      }, 0);
  }, [bookings, view.year, view.month, kathmanduDayKey]);

  return (
    <div className="space-y-5">
      {/* Month navigator */}
      <div
        className="rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-center flex-1">
            <h2 className="text-lg font-bold text-white">{meta.monthLabel}</h2>
            <div className="flex items-center justify-center gap-3 mt-0.5">
              <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.4)" }}>
                Total: <span className="text-white font-semibold">{formatRs(monthTotal)}</span>
              </span>
              {(view.year !== todayYm.year || view.month !== todayYm.month) && (
                <button
                  type="button"
                  onClick={goTodayMonth}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all"
                  style={{ color: "#e2e8f0", background: "rgba(226,232,240,0.1)" }}
                >
                  Jump to today
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {WEEK_HEADERS.map((h) => (
            <div
              key={h}
              className="py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
          {cells.map((ymd, idx) => {
            if (!ymd) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-md"
                  style={{ background: "hsl(var(--background))" }}
                />
              );
            }

            const list = getBookingsForDateSorted(bookings, ymd);
            const hasBookings = list.length > 0;
            const clickable = ymd >= last30.start && ymd <= last30.end;
            const selected = selectedYmd === ymd;
            const dayNum = parseInt(ymd.slice(8), 10);
            const isToday = ymd === `${String(todayYm.year)}-${String(todayYm.month).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

            if (!clickable) {
              return (
                <div
                  key={ymd}
                  className="aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 cursor-not-allowed select-none"
                  style={{
                    background: "hsl(var(--background))",
                    opacity: hasBookings ? 0.5 : 0.25,
                  }}
                  title="Only the last 30 days are interactive"
                >
                  <span className="text-xs font-medium text-white tabular-nums">{dayNum}</span>
                  {hasBookings && (
                    <span className="text-[9px] font-bold" style={{ color: "#e2e8f0" }}>{list.length}</span>
                  )}
                </div>
              );
            }

            return (
              <button
                key={ymd}
                type="button"
                onClick={() => setSelectedYmd(selected ? null : ymd)}
                className="aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-all"
                style={{
                  background: selected
                    ? "rgba(226,232,240,0.2)"
                    : hasBookings
                      ? "rgba(226,232,240,0.06)"
                      : "hsl(var(--background))",
                  border: selected
                    ? "1px solid rgba(226,232,240,0.45)"
                    : isToday
                      ? "1px solid rgba(226,232,240,0.3)"
                      : hasBookings
                        ? "1px solid rgba(226,232,240,0.15)"
                        : "1px solid transparent",
                  boxShadow: selected ? "0 0 12px rgba(226,232,240,0.15)" : undefined,
                }}
              >
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: selected ? "#f8fafc" : isToday ? "#e2e8f0" : "rgba(255,255,255,0.75)" }}
                >
                  {dayNum}
                </span>
                {hasBookings && (
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{ color: selected ? "#f8fafc" : "#e2e8f0" }}
                  >
                    {list.length} bk
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "#e2e8f0" }} />
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Has bookings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border" style={{ borderColor: "rgba(226,232,240,0.3)", background: "transparent" }} />
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Older (read-only)</span>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedYmd && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(226,232,240,0.25)" }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "rgba(226,232,240,0.08)", borderBottom: "1px solid rgba(226,232,240,0.15)" }}
          >
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-4 w-4" style={{ color: "#e2e8f0" }} />
              <div>
                <p className="text-sm font-bold text-white">{selectedYmd}</p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Day total</p>
                <p className="text-base font-bold tabular-nums" style={{ color: "#e2e8f0" }}>{formatRs(dayTotal)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedYmd(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bookings list */}
          <div className="p-4">
            {dayBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Music2 className="h-8 w-8 mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No bookings on this day</p>
              </div>
            ) : (
              <ul className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {dayBookings.map((b) => {
                  const room = ROOMS.find((r) => r.id === b.room);
                  return (
                    <li
                      key={b.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-3"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ background: "rgba(226,232,240,0.12)", color: "#e2e8f0" }}
                      >
                        🎸
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{b.bandName}</p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {room?.name} · {formatHourRange(b.hour)}
                        </p>
                        {b.contactDetails && (
                          <p className="text-xs mt-0.5 break-words" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {b.contactDetails}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: "#e2e8f0" }}>
                        {formatRs(room?.price ?? 0)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
