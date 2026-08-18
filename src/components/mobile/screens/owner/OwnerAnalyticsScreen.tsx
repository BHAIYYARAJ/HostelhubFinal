import { CalendarCheck, Eye, IndianRupee, Star } from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppCard, EmptyState, StatTile } from "@/components/mobile/MobileKit";
import { useOwnerBookings } from "@/hooks/useBookings";
import { useOwnerHostels } from "@/hooks/useHostels";
import { useAuthStore } from "@/store/useAuthStore";

export function OwnerAnalyticsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: listings = [] } = useOwnerHostels(user?.id);
  const { data: bookings = [] } = useOwnerBookings();

  const totalViews = listings.reduce((a, l) => a + (l.views || 0), 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const revenue = confirmed.reduce((a, b) => a + Number(b.monthly_rent || 0), 0);
  const rated = listings.filter((l) => (l.review_count || 0) > 0);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((a, l) => a + Number(l.rating || 0), 0) / rated.length).toFixed(1)
      : "0.0";

  const maxViews = Math.max(1, ...listings.map((l) => l.views || 0));

  return (
    <AppScreen>
      <AppHeader title="Analytics" subtitle="Performance overview" />

      <ScreenSection>
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            tone="primary"
            icon={IndianRupee}
            label="Monthly revenue"
            value={`₹${revenue.toLocaleString("en-IN")}`}
          />
          <StatTile icon={Eye} label="Total views" value={totalViews.toLocaleString("en-IN")} />
          <StatTile icon={CalendarCheck} label="Confirmed bookings" value={confirmed.length} />
          <StatTile icon={Star} label="Average rating" value={avgRating} />
        </div>
      </ScreenSection>

      <ScreenSection title="Views by listing" className="pb-8">
        {listings.length === 0 ? (
          <EmptyState
            icon={Eye}
            title="No data yet"
            body="Once you publish listings, view and booking trends appear here."
          />
        ) : (
          <AppCard>
            <div className="space-y-4">
              {listings.map((l) => (
                <div key={l.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[14px] font-bold text-foreground">{l.name}</p>
                    <p className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                      {(l.views || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, ((l.views || 0) / maxViews) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AppCard>
        )}
      </ScreenSection>
    </AppScreen>
  );
}
