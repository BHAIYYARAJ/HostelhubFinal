import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { useOwnerBookings } from "@/hooks/useBookings";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const RevenueChart = () => {
  const { data: bookings = [] } = useOwnerBookings();

  const data = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; month: string; revenue: number; bookings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: MONTHS[d.getMonth()],
        revenue: 0,
        bookings: 0,
      });
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    for (const a of bookings) {
      if (a.status !== "confirmed") continue;
      const d = new Date(a.move_in_date || a.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(key);
      if (i === undefined) continue;
      buckets[i].revenue += Number(a.monthly_rent || 0);
      buckets[i].bookings += 1;
    }
    return buckets;
  }, [bookings]);

  const hasData = data.some((d) => d.revenue > 0);

  return (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
    className="rounded-xl border border-border bg-card p-6 shadow-card"
  >
    <h3 className="text-base font-semibold text-foreground">Revenue Trend</h3>
    <p className="mb-4 text-sm text-muted-foreground">Last 6 months performance</p>
    {!hasData ? (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
        <p className="text-sm font-medium text-foreground">No data available</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Revenue will appear here once you have confirmed bookings.
        </p>
      </div>
    ) : (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 72% 56%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(0 72% 56%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(0 0% 45%)" }} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(0 0% 45%)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(0 0% 90%)",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
              fontSize: 13,
            }}
            formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(0 72% 56%)"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    )}
  </motion.div>
  );
};

export default RevenueChart;
