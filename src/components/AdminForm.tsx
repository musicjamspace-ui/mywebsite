"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ROOMS,
  TIME_SLOTS,
  getDates,
  formatHour,
  formatRs,
  type Booking,
} from "@/lib/bookingStore";
import { createBookingApi, updateBookingApi, deleteBookingApi } from "@/lib/api";
import { BOOKINGS_QUERY_KEY } from "@/hooks/useBookingsQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useKathmanduDayKey } from "@/hooks/useKathmanduDayKey";
import { CalendarPlus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Props {
  bookings: Booking[];
  editBooking?: Booking | null;
  prefill?: { room: number; date: string; hour: number } | null;
  onDone: () => void;
}

export default function AdminForm({ bookings, editBooking, prefill, onDone }: Props) {
  const queryClient = useQueryClient();
  const kathmanduDayKey = useKathmanduDayKey();
  const dates = useMemo(() => {
    void kathmanduDayKey;
    return getDates();
  }, [kathmanduDayKey]);

  const [room, setRoom] = useState<string>(String(editBooking?.room ?? prefill?.room ?? 1));
  const [date, setDate] = useState(editBooking?.date ?? prefill?.date ?? dates[0].date);
  const [hour, setHour] = useState<string>(String(editBooking?.hour ?? prefill?.hour ?? 6));
  const [bandName, setBandName] = useState(editBooking?.bandName ?? "");
  const [contactDetails, setContactDetails] = useState(editBooking?.contactDetails ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (prefill) {
      setRoom(String(prefill.room));
      setDate(prefill.date);
      setHour(String(prefill.hour));
    }
  }, [prefill]);

  useEffect(() => {
    if (editBooking) {
      setRoom(String(editBooking.room));
      setDate(editBooking.date);
      setHour(String(editBooking.hour));
      setBandName(editBooking.bandName);
      setContactDetails(editBooking.contactDetails ?? "");
    }
  }, [editBooking]);

  const occupiedByHour = useMemo(() => {
    const map = new Map<number, Booking>();
    const roomN = Number(room);
    for (const b of bookings) {
      if (Number(b.room) !== roomN) continue;
      if (b.date !== date) continue;
      if (editBooking && b.id === editBooking.id) continue;
      map.set(Number(b.hour), b);
    }
    return map;
  }, [bookings, room, date, editBooking]);

  useEffect(() => {
    const current = Number(hour);
    if (!occupiedByHour.has(current)) return;
    const firstAvailable = TIME_SLOTS.find((h) => !occupiedByHour.has(h));
    if (firstAvailable != null) setHour(String(firstAvailable));
  }, [hour, occupiedByHour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandName.trim()) {
      toast.error("Please enter a band name");
      return;
    }
    const contactTrim = contactDetails.trim();
    const contactPayload = contactTrim ? contactTrim : null;

    setBusy(true);
    try {
      if (editBooking) {
        await updateBookingApi(editBooking.id, {
          room: Number(room) as 1 | 2,
          date,
          hour: Number(hour),
          bandName: bandName.trim(),
          contactDetails: contactPayload,
        });
        toast.success("Booking updated!");
        resetForm();
        onDone();
      } else {
        await createBookingApi({
          room: Number(room) as 1 | 2,
          date,
          hour: Number(hour),
          bandName: bandName.trim(),
          contactDetails: contactPayload,
        });
        toast.success("Booking created!");
        resetForm();
        onDone();
      }
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!editBooking) return;
    setBusy(true);
    try {
      await deleteBookingApi(editBooking.id);
      toast.success("Booking deleted");
      resetForm();
      onDone();
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setBandName("");
    setContactDetails("");
    setRoom("1");
    setDate(dates[0].date);
    setHour("6");
  };

  const selectedRoom = ROOMS.find((r) => r.id === Number(room));
  const takenCount = occupiedByHour.size;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${editBooking ? "rgba(226,232,240,0.3)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      {/* Form header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: editBooking ? "rgba(226,232,240,0.08)" : "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          {editBooking ? (
            <Pencil className="h-4 w-4" style={{ color: "#e2e8f0" }} />
          ) : (
            <CalendarPlus className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {editBooking ? "Edit Booking" : "New Booking"}
            </p>
            {editBooking && (
              <p className="text-[11px]" style={{ color: "#e2e8f0" }}>
                Editing: {editBooking.bandName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editBooking && (
            <button
              type="button"
              onClick={() => { resetForm(); onDone(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
              title="Cancel edit"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Form body */}
      <div className="p-5 space-y-4">
        {/* Row 1: Room · Date · Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Room */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.38)" }}>
              Room
            </Label>
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="border-white/10 bg-white/5 text-white focus:border-primary/50 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name} — {formatRs(r.price)}/hr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoom && (
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {formatRs(selectedRoom.price)} / hour
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.38)" }}>
              Date
            </Label>
            <Select value={date} onValueChange={setDate}>
              <SelectTrigger className="border-white/10 bg-white/5 text-white focus:border-primary/50 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d.date} value={d.date}>
                    {d.dayName} {d.label}{d.isToday ? " · Today" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slot */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.38)" }}>
              Time Slot
            </Label>
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger className="border-white/10 bg-white/5 text-white focus:border-primary/50 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((h) => {
                  const takenBy = occupiedByHour.get(h);
                  return (
                    <SelectItem
                      key={h}
                      value={String(h)}
                      disabled={Boolean(takenBy)}
                      className={takenBy ? "opacity-40" : undefined}
                    >
                      {takenBy
                        ? `${formatHour(h)} – ${formatHour(h + 1)} · Taken by ${takenBy.bandName}`
                        : `${formatHour(h)} – ${formatHour(h + 1)}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {takenCount > 0 && (
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {takenCount} slot{takenCount !== 1 ? "s" : ""} already booked on this date
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Band Name · Contact · Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          {/* Band name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.38)" }}>
              Band / Artist Name
            </Label>
            <Input
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="Enter band or artist name"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.38)" }}>
              Contact <span style={{ color: "rgba(255,255,255,0.22)" }}>(optional)</span>
            </Label>
            <Input
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              placeholder="Phone, email, or other contact info"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy}
              className="gap-2 font-semibold whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #e2e8f0, #64748b)",
                border: "none",
                boxShadow: "0 4px 16px rgba(148,163,184,0.25)",
              }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editBooking ? "Update Booking" : "Create Booking"}
            </Button>
            {editBooking && (
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={handleDelete}
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
