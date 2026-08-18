import { useMemo, useState } from "react";
import { CalendarCheck, CalendarDays, Check, Loader2, Mail, Phone, X } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppCard, EmptyState, Segmented, StatusPill } from "@/components/mobile/MobileKit";
import { updateBookingStatus, useOwnerBookings, type BookingStatus } from "@/hooks/useBookings";

const FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
];

export function OwnerBookingsScreen() {
  const { data: bookings = [], isLoading } = useOwnerBookings();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [acting, setActing] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter],
  );

  const act = async (id: string, action: "confirmed" | "rejected") => {
    setActing(id);
    try {
      await updateBookingStatus(id, action);
      toast.success(action === "confirmed" ? "Booking confirmed" : "Booking rejected");
    } catch (e: any) {
      toast.error(e?.message || "Could not update booking");
    } finally {
      setActing(null);
    }
  };

  return (
    <AppScreen>
      <AppHeader title="Bookings" subtitle={`${bookings.length} total requests`} />

      <div className="px-4 pt-4">
        <Segmented value={filter} onChange={setFilter} options={FILTERS} />
      </div>

      <ScreenSection className="pb-8">
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Nothing here"
            body="New booking requests from students will show up on this screen."
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <AppCard key={b.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold tracking-tight text-foreground">
                      {b.student_name}
                    </p>
                    <p className="truncate text-[12.5px] text-muted-foreground">
                      {b.hostel?.name} · {b.room_type}
                    </p>
                  </div>
                  <StatusPill status={b.status} />
                </div>

                <div className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    Move-in{" "}
                    {new Date(b.move_in_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <a href={`tel:${b.student_phone}`} className="flex items-center gap-2 text-primary">
                    <Phone className="h-4 w-4 shrink-0" />
                    {b.student_phone}
                  </a>
                  <a href={`mailto:${b.student_email}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{b.student_email}</span>
                  </a>
                </div>

                {b.notes && (
                  <p className="mt-3 rounded-2xl bg-muted p-3 text-[13px] leading-relaxed text-foreground">
                    {b.notes}
                  </p>
                )}

                <p className="mt-3 text-[15px] font-extrabold text-foreground">
                  ₹{Number(b.monthly_rent ?? 0).toLocaleString("en-IN")}
                  <span className="text-[12px] font-semibold text-muted-foreground">/month</span>
                </p>

                {b.status === "pending" && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={acting === b.id}
                      onClick={() => act(b.id, "rejected")}
                      className="tap flex h-12 items-center justify-center gap-2 rounded-2xl bg-muted text-[14px] font-bold text-foreground disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={acting === b.id}
                      onClick={() => act(b.id, "confirmed")}
                      className="tap flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-bold text-primary-foreground disabled:opacity-50"
                    >
                      {acting === b.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Confirm
                    </button>
                  </div>
                )}
              </AppCard>
            ))}
          </div>
        )}
      </ScreenSection>
    </AppScreen>
  );
}
