"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  addDaysToYmd,
  formatRs,
  getDailyEarnings,
  getKathmanduWeekEarnings,
  getLastNDaysYmdRangeKathmandu,
  getMonthlyEarnings,
  getDailyEarningsSeries,
  getWeeklyEarningsSeries,
  getRoomRevenueSplitForCurrentMonth,
  getYmdInKathmandu,
} from "@/lib/bookingStore";
import { useKathmanduDayKey } from "@/hooks/useKathmanduDayKey";
import { useRevenueNow } from "@/hooks/useRevenueNow";
import { useBookingsQuery } from "@/hooks/useBookingsQuery";
import { TrendingUp, Calendar, BarChart2, PieChart as PieIcon } from "lucide-react";

const ROOM_COLORS = ["#94a3b8", "#34d399"];

const CARD_ACCENTS = [
  { color: "#e2e8f0", bg: "rgba(226,232,240,0.1)", border: "rgba(226,232,240,0.2)", label: "Today's Revenue", icon: TrendingUp },
  { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", label: "This Week (Sun–Sat)", icon: Calendar },
  { color: "#cbd5e1", bg: "rgba(203,213,225,0.1)", border: "rgba(203,213,225,0.2)", label: "This Month", icon: BarChart2 },
];

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
        style={{ background: "rgba(226,232,240,0.12)", border: "1px solid rgba(226,232,240,0.2)" }}
      >
        <Icon className="h-4 w-4" style={{ color: "#e2e8f0" }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {sub && <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>}
      </div>
    </div>
  );
}

type TooltipValue = number | string;

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: TooltipValue }>;
  label?: string;
  formatter?: (value: number) => string;
};

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const rawValue = payload[0]?.value;
  const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue) || 0;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-xl"
      style={{
        background: "#141428",
        border: "1px solid rgba(226,232,240,0.25)",
        color: "white",
      }}
    >
      <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
      <p className="font-bold" style={{ color: "#e2e8f0" }}>
        {formatter ? formatter(numericValue) : rawValue}
      </p>
    </div>
  );
}

export default function AdminRevenueContent() {
  const kathmanduDayKey = useKathmanduDayKey();
  const revenueNow = useRevenueNow();
  const { data: bookings = [] } = useBookingsQuery();

  const stats = useMemo(() => {
    void kathmanduDayKey;
    const todayYmd = getYmdInKathmandu(revenueNow);
    return {
      today: getDailyEarnings(bookings, todayYmd, revenueNow),
      week: getKathmanduWeekEarnings(bookings, revenueNow),
      month: getMonthlyEarnings(bookings, revenueNow),
    };
  }, [bookings, kathmanduDayKey, revenueNow]);

  const statValues = [stats.today, stats.week, stats.month];

  const daily14 = useMemo(() => {
    void kathmanduDayKey;
    const end = getYmdInKathmandu(revenueNow);
    const start = addDaysToYmd(end, -13);
    return getDailyEarningsSeries(bookings, start, end, revenueNow);
  }, [bookings, kathmanduDayKey, revenueNow]);

  const weekly8 = useMemo(() => {
    void kathmanduDayKey;
    return getWeeklyEarningsSeries(bookings, 8, revenueNow);
  }, [bookings, kathmanduDayKey, revenueNow]);

  const last30Range = useMemo(() => {
    void kathmanduDayKey;
    return getLastNDaysYmdRangeKathmandu(30, revenueNow);
  }, [kathmanduDayKey, revenueNow]);

  const daily30 = useMemo(() => {
    return getDailyEarningsSeries(bookings, last30Range.start, last30Range.end, revenueNow);
  }, [bookings, last30Range.start, last30Range.end, revenueNow]);

  const roomSplit = useMemo(() => {
    void kathmanduDayKey;
    return getRoomRevenueSplitForCurrentMonth(bookings, revenueNow);
  }, [bookings, kathmanduDayKey, revenueNow]);

  const hasRoomData = roomSplit.some((r) => r.amount > 0);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARD_ACCENTS.map((card, i) => (
          <div
            key={card.label}
            className="relative rounded-xl p-5 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${card.border}` }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${card.color}70, transparent)` }}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-white leading-none tabular-nums">
                  {formatRs(statValues[i])}
                </p>
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}
              >
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart - daily 14 days */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <SectionHeader icon={BarChart2} title="Daily Revenue" sub="Last 14 days" />
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily14} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#475569" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `Rs.${v}`}
              />
              <Tooltip
                content={<CustomTooltip formatter={(v: number) => formatRs(v)} />}
                cursor={{ fill: "rgba(226,232,240,0.05)" }}
              />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area chart - 30 day trend */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <SectionHeader icon={TrendingUp} title="Revenue Trend" sub="Last 30 days · daily" />
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily30} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(d) => d.slice(8)}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `Rs.${v}`}
              />
              <Tooltip
                content={<CustomTooltip formatter={(v: number) => formatRs(v)} />}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#e2e8f0"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#e2e8f0", stroke: "rgba(226,232,240,0.3)", strokeWidth: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <SectionHeader icon={Calendar} title="Weekly Revenue" sub="Last 8 Sun–Sat weeks" />
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly8} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="weekGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `Rs.${v}`}
              />
              <Tooltip
                content={<CustomTooltip formatter={(v: number) => formatRs(v)} />}
                cursor={{ fill: "rgba(52,211,153,0.05)" }}
              />
              <Bar dataKey="amount" fill="url(#weekGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room split pie */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <SectionHeader icon={PieIcon} title="Room Revenue Split" sub="This calendar month · completed slots only" />
        {!hasRoomData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PieIcon className="h-10 w-10 mb-3" style={{ color: "rgba(255,255,255,0.12)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No revenue yet this month</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-56 w-full max-w-xs shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomSplit}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {roomSplit.map((_, i) => (
                      <Cell
                        key={i}
                        fill={ROOM_COLORS[i % ROOM_COLORS.length]}
                        opacity={0.9}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatRs(v)}
                    contentStyle={{
                      background: "#141428",
                      border: "1px solid rgba(226,232,240,0.25)",
                      borderRadius: 8,
                      color: "white",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 min-w-0 flex-1">
              {roomSplit.map((r, i) => {
                const total = roomSplit.reduce((s, x) => s + x.amount, 0);
                const pct = total > 0 ? Math.round((r.amount / total) * 100) : 0;
                return (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ROOM_COLORS[i] }} />
                        <span className="text-sm text-white">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>{pct}%</span>
                        <span className="text-sm font-semibold tabular-nums" style={{ color: ROOM_COLORS[i] }}>{formatRs(r.amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: ROOM_COLORS[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
