"use client";

import { useEffect, useState } from "react";
import { getYmdInKathmandu } from "@/lib/bookingStore";

/**
 * Tracks the current calendar date in Asia/Kathmandu. The value changes right after
 * 23:59:59 NPT when the new day starts at 00:00:00, so “today” in the schedule moves to first column.
 */
export function useKathmanduDayKey(): string {
  const [ymd, setYmd] = useState(() => getYmdInKathmandu());

  useEffect(() => {
    const sync = () => {
      const next = getYmdInKathmandu();
      setYmd((prev) => (next !== prev ? next : prev));
    };

    sync();
    const intervalId = window.setInterval(sync, 15_000);

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return ymd;
}
