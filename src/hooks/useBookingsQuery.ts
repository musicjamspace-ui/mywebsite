"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBookings } from "@/lib/api";

export const BOOKINGS_QUERY_KEY = ["bookings"] as const;

export function useBookingsQuery() {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: fetchBookings,
    staleTime: 0,            // always consider data stale → refetch on every mount/focus
    refetchInterval: 15_000, // poll every 15 s so the grid stays live
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
