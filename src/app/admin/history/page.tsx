"use client";

import RequireBookAccess from "@/components/RequireBookAccess";
import AdminHistoryContent from "@/components/AdminHistoryContent";
import AdminShell from "@/components/AdminShell";

export default function AdminHistoryPage() {
  return (
    <RequireBookAccess>
      <AdminShell activeKey="history">
        <div className="p-6 max-w-2xl">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white">Booking History</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Browse any month (Kathmandu) · Last 30 days are interactive
            </p>
          </div>
          <AdminHistoryContent />
        </div>
      </AdminShell>
    </RequireBookAccess>
  );
}
