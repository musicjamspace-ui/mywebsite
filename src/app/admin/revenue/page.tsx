"use client";

import RequireBookAccess from "@/components/RequireBookAccess";
import AdminRevenueContent from "@/components/AdminRevenueContent";
import AdminShell from "@/components/AdminShell";

export default function AdminRevenuePage() {
  return (
    <RequireBookAccess>
      <AdminShell activeKey="revenue">
        <div className="p-6">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white">Revenue Analytics</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Kathmandu time · Slots count as revenue after they end (NPT)
            </p>
          </div>
          <AdminRevenueContent />
        </div>
      </AdminShell>
    </RequireBookAccess>
  );
}
