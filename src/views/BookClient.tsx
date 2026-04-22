"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Phone } from "lucide-react";
import { ROOMS, formatRs } from "@/lib/bookingStore";
import CalendarGrid from "@/components/CalendarGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useBookingsQuery } from "@/hooks/useBookingsQuery";
const BOOKING_PHONE_DISPLAY = "986-0342125";
const BOOKING_PHONE_TEL = "+9779860342125";

function tabValueFromRoomParam(room: string | null): "room-1" | "room-2" {
  return room === "2" ? "room-2" : "room-1";
}

export default function BookClient() {
  const [refreshKey] = useState(0);
  const { data: bookings = [] } = useBookingsQuery();
  const searchParams = useSearchParams();
  const defaultTab = tabValueFromRoomParam(searchParams.get("room"));

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="container max-w-full px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3 sm:pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Schedule</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Live availability for both rooms</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <a href={`tel:${BOOKING_PHONE_TEL}`}>
                  <Phone className="h-4 w-4" aria-hidden />
                  {BOOKING_PHONE_DISPLAY}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container flex-1 px-3 sm:px-6 py-4 space-y-3 sm:space-y-4 max-w-full">
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Swipe sideways for more dates. Need to confirm quickly? Call {BOOKING_PHONE_DISPLAY}.
        </p>

        <Tabs key={defaultTab} defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 gap-1">
            {ROOMS.map((r) => (
              <TabsTrigger
                key={r.id}
                value={`room-${r.id}`}
                className="flex flex-col gap-0.5 py-2.5 px-2 h-auto min-h-[3rem] text-xs sm:text-sm whitespace-normal touch-manipulation data-[state=active]:shadow-sm"
              >
                <span className="font-semibold leading-tight text-center">{r.name}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-mono font-normal">
                  {formatRs(r.price)}/hr
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="room-1" className="mt-3 focus-visible:outline-none">
            <CalendarGrid room={ROOMS[0]} bookings={bookings} refreshKey={refreshKey} embedded />
          </TabsContent>
          <TabsContent value="room-2" className="mt-3 focus-visible:outline-none">
            <CalendarGrid room={ROOMS[1]} bookings={bookings} refreshKey={refreshKey} embedded />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
