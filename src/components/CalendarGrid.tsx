"use client";

import { useState, useMemo } from "react";
import {
  getScheduleDatesForRoom,
  getYmdInKathmandu,
  getHourInKathmandu,
  normalizeBookingYmd,
  DEFAULT_SCHEDULE_DAYS_AFTER_TODAY,
  TIME_SLOTS,
  formatHourRange,
  formatRs,
  type Booking,
  type Room,
} from "@/lib/bookingStore";
import BookingModal from "./BookingModal";
import { useKathmanduDayKey } from "@/hooks/useKathmanduDayKey";

interface CalendarGridProps {
  room: Room;
  bookings: Booking[];
  refreshKey?: number;
  onSlotClick?: (room: number, date: string, hour: number) => void;
  onAdminSelectBooking?: (booking: Booking) => void;
  isAdmin?: boolean;
  /** Hide title/legend row when the room is already indicated (e.g. mobile tabs). */
  embedded?: boolean;
}

export default function CalendarGrid({
  room,
  bookings,
  refreshKey,
  onSlotClick,
  onAdminSelectBooking,
  isAdmin,
  embedded = false,
}: CalendarGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const kathmanduDayKey = useKathmanduDayKey();
  const dates = useMemo(() => {
    void refreshKey;
    void kathmanduDayKey;
    const now = new Date();
    return getScheduleDatesForRoom(bookings, room.id, DEFAULT_SCHEDULE_DAYS_AFTER_TODAY, now);
  }, [refreshKey, kathmanduDayKey, bookings, room.id]);

  const now = new Date();
  const todayStr = getYmdInKathmandu(now);
  const currentHour = getHourInKathmandu(now);

  const getSlotBooking = (date: string, hour: number) =>
    bookings.find(
      (b) =>
        Number(b.room) === Number(room.id) &&
        normalizeBookingYmd(b.date) === date &&
        Number(b.hour) === Number(hour),
    );

  const timeCol = "52px";
  const colMinPx = 40;
  const minTableWidth = Math.max(320, 52 + dates.length * colMinPx);
  const gridCols = `${timeCol} repeat(${dates.length}, minmax(${colMinPx}px, 1fr))`;

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {!embedded ? (
          <div className="p-3 sm:p-4 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-base sm:text-lg leading-tight">{room.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">{formatRs(room.price)}/hour</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-slot-available" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-slot-booked" /> Booked
              </span>
            </div>
          </div>
        ) : null}

        <div
          className="overflow-x-auto overscroll-x-contain touch-auto [-webkit-overflow-scrolling:touch] scroll-smooth"
          role="region"
          aria-label="Schedule grid, scroll horizontally for more days"
        >
          <div className="w-full" style={{ minWidth: minTableWidth }}>
            {/* Header row */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: gridCols }}>
              <div
                className="p-1.5 sm:p-2 text-[10px] sm:text-xs text-muted-foreground font-mono sticky left-0 z-10 bg-card border-r border-border/80 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.35)]"
                style={{ width: timeCol, minWidth: timeCol, maxWidth: timeCol }}
              >
                Time
              </div>
              {dates.map((d) => (
                <div
                  key={d.date}
                  className={`p-1.5 sm:p-2 text-center text-[10px] sm:text-xs border-l border-border ${
                    d.isToday
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className="font-semibold leading-tight">{d.dayName}</div>
                  <div className="leading-tight opacity-80">{d.label}</div>
                  {/* Booking count indicator */}
                  {(() => {
                    const dayCount = bookings.filter(
                      (b) => Number(b.room) === Number(room.id) && normalizeBookingYmd(b.date) === d.date,
                    ).length;
                    return dayCount > 0 ? (
                      <div
                        className="mt-0.5 mx-auto h-1 rounded-full"
                        style={{
                          width: `${Math.min(100, dayCount * 20)}%`,
                          minWidth: 4,
                          background: "hsl(var(--slot-booked))",
                          opacity: 0.7,
                        }}
                      />
                    ) : null;
                  })()}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {TIME_SLOTS.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-border last:border-b-0"
                style={{ gridTemplateColumns: gridCols }}
              >
                <div
                  className="p-1.5 sm:p-2 text-[10px] sm:text-xs text-muted-foreground font-mono flex items-center sticky left-0 z-10 bg-card border-r border-border/80 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.35)]"
                  style={{ width: timeCol, minWidth: timeCol, maxWidth: timeCol }}
                >
                  <span className="leading-tight">{formatHourRange(hour)}</span>
                </div>
                {dates.map((d) => {
                  const booking = getSlotBooking(d.date, hour);
                  const isCurrent = d.date === todayStr && hour === currentHour;
                  const isPast = d.date < todayStr || (d.date === todayStr && hour < currentHour);

                  return (
                    <button
                      type="button"
                      key={`${d.date}-${hour}`}
                      onClick={() => {
                        if (booking) {
                          if (isAdmin && onAdminSelectBooking) {
                            onAdminSelectBooking(booking);
                          } else {
                            setSelectedBooking(booking);
                          }
                        } else if (isAdmin && onSlotClick && !isPast) {
                          onSlotClick(room.id, d.date, hour);
                        }
                      }}
                      className={`
                        min-w-0 w-full p-0.5 sm:p-1 text-[10px] sm:text-xs border-l border-border transition-colors min-h-[44px] sm:min-h-[40px] relative
                        flex items-start justify-center text-center touch-manipulation
                        ${isCurrent ? "ring-1 ring-inset ring-slot-current" : ""}
                        ${isPast && !booking ? "opacity-35" : ""}
                        ${
                          booking
                            ? "bg-slot-booked/15 hover:bg-slot-booked/25 cursor-pointer"
                            : isPast
                              ? "bg-card"
                              : isAdmin
                                ? "bg-slot-available/8 hover:bg-slot-available/25 hover:ring-1 hover:ring-inset hover:ring-slot-available/40 cursor-pointer"
                                : "bg-slot-available/8 hover:bg-slot-available/20 cursor-pointer"
                        }
                      `}
                      title={
                        booking
                          ? `${booking.bandName} — click to edit`
                          : isPast
                            ? "Past slot"
                            : isAdmin
                              ? "Click to book this slot"
                              : undefined
                      }
                    >
                      {booking ? (
                        <span
                          className="text-slot-booked font-medium w-full min-w-0 px-0.5 leading-snug break-words line-clamp-4"
                          title={booking.bandName?.trim() || "Booked"}
                        >
                          🎸 {booking.bandName?.trim() || "Booked"}
                        </span>
                      ) : !isPast ? (
                        <span className="text-slot-available text-[11px] font-bold leading-none" aria-hidden>
                          {isAdmin ? "+" : "·"}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!(isAdmin && onAdminSelectBooking) && (
        <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </>
  );
}
