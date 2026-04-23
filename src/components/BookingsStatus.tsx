"use client";

import { useBookingsQuery } from "@/hooks/useBookingsQuery";
import { apiUrl } from "@/lib/api";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";

export default function BookingsStatus() {
  const { isLoading, isError, error, data, isFetching } = useBookingsQuery();

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg px-4 py-2.5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          Loading schedule from API…
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-xl p-4 space-y-2"
        style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "#f87171" }} />
          <p className="text-sm font-semibold" style={{ color: "#f87171" }}>
            Could not connect to the booking API
          </p>
        </div>
        <p className="text-xs pl-6 break-words" style={{ color: "rgba(255,255,255,0.45)" }}>
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <p className="text-xs pl-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          Make sure the Express server is running.{" "}
          <a
            href={apiUrl("/api/health")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline hover:no-underline transition-all"
            style={{ color: "#f87171" }}
          >
            Check health endpoint
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg px-4 py-2"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Loader2 className="h-3 w-3 animate-spin shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Refreshing…
        </span>
      </div>
    );
  }

  if (data !== undefined && !isFetching) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg px-4 py-2"
        style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.12)" }}
      >
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.5)" }}
        />
        <span className="text-[11px] font-medium" style={{ color: "rgba(52,211,153,0.9)" }}>
          API connected · {data.length} booking{data.length !== 1 ? "s" : ""} loaded
        </span>
        {data.length === 0 && (
          <a
            href={apiUrl("/api/debug/bookings")}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-[11px] underline hover:no-underline"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Debug
          </a>
        )}
      </div>
    );
  }

  return null;
}
