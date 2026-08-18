import { motion } from "framer-motion";
import { Eye, CalendarCheck, IndianRupee, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOwnerHostels } from "@/hooks/useHostels";
import { useOwnerBookings } from "@/hooks/useBookings";

const AnalyticsCards = () => {
  const user = useAuthStore((s) => s.user);
  const { data: listings = [] } = useOwnerHostels(user?.id);
  const { data: bookings = [] } = useOwnerBookings();

  const totalViews = listings.reduce((a, l) => a + (l.views || 0), 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const totalBookings = confirmed.length;
  const totalRevenue = confirmed.reduce((a, b) => a + Number(b.monthly_rent || 0), 0);
  const rated = listings.filter((l) => (l.review_count || 0) > 0);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((a, l) => a + Number(l.rating || 0), 0) / rated.length).toFixed(1)
      : "0.0";

  const cards = [
    {
      label: "Total Views",
      value: totalViews.toLocaleString("en-IN"),
      icon: Eye,
      change: "+12.3%",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Bookings",
      value: totalBookings.toString(),
      icon: CalendarCheck,
      change: "+8.1%",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      change: "+18.7%",
      color: "text-primary bg-coral-light",
    },
    {
      label: "Avg Rating",
      value: avgRating,
      icon: TrendingUp,
      change: "+0.2",
      color: "text-amber-600 bg-amber-50",
    },
  ];

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">No analytics data available yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first property to start generating analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <div className={`rounded-lg p-2 ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {card.value}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Live from database</p>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
