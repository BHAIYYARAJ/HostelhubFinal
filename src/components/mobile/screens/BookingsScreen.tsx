import { useMemo, useState } from "react";
import { CalendarCheck, CalendarDays, Loader2, MapPin } from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import {
  AppButton,
  AppCard,
  EmptyState,
  Segmented,
  StatusPill,
} from "@/components/mobile/MobileKit";
import { useStudentBookings } from "@/hooks/useBookings";
import { Link } from "@/lib/router-compat";
import { useAuthStore } from "@/store/useAuthStore";

type Tab = "upcoming" | "past";

export function BookingsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: bookings, isLoading } = useStudentBookings();
  const [tab, setTab] = useState<Tab>("upcoming");

  const { upcoming, past } = useMemo(() => {
    const list = bookings ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return {
      upcoming: list.filter((b) => b.status !== "cancelled" && b.move_in_date >= today),
      past: list.filter((b) => b.status === "cancelled" || b.move_in_date < today),
    };
  }, [bookings]);

  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <AppScreen>
      <AppHeader title="My Bookings" subtitle={`${bookings?.length ?? 0} total requests`} />

      {!user ? (
        <EmptyState
          icon={CalendarCheck}
          title="Sign in to see bookings"
          body="Your booking requests and their status live here."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : (
        <>
          <div className="px-4 pt-4">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: "upcoming", label: `Upcoming (${upcoming.length})` },
                { value: "past", label: `Past (${past.length})` },
              ]}
            />
          </div>

          <ScreenSection className="pb-6">
            {isLoading ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : visible.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title={tab === "upcoming" ? "No upcoming bookings" : "Nothing in your history"}
                body="Find a hostel you like and send a booking request."
                action={<AppButton to="/">Browse stays</AppButton>}
              />
            ) : (
              <div className="space-y-4">
                {visible.map((b) => (
                  <AppCard key={b.id} padded={false}>
                    <Link to={`/hostel/${b.hostel_id}`} className="tap block">
                      <div className="flex gap-3 p-3">
                        <img
                          src={b.hostel?.images?.[0]}
                          alt={b.hostel?.name ?? "Hostel"}
                          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                            <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                              {b.hostel?.name ?? "Hostel"}
                            </p>
                            <StatusPill status={b.status} />
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {b.hostel?.location}, {b.hostel?.city}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold text-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Date(b.move_in_date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            <span className="text-muted-foreground">· {b.room_type}</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between border-t border-app-hairline px-4 py-3">
                      <span className="text-[12px] font-semibold text-muted-foreground">
                        Monthly rent
                      </span>
                      <span className="text-[15px] font-extrabold tracking-tight text-foreground">
                        ₹{Number(b.monthly_rent).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </AppCard>
                ))}
              </div>
            )}
          </ScreenSection>
        </>
      )}
    </AppScreen>
  );
}
