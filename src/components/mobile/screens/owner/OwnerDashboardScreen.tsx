import {
  BarChart3,
  Building2,
  CalendarCheck,
  FileText,
  IndianRupee,
  Loader2,
  MessageSquare,
  MessageSquareWarning,
  Plus,
  ShieldCheck,
  Star,
  UserCog,
} from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import {
  AppButton,
  EmptyState,
  ListGroup,
  ListRow,
  StatTile,
  StatusPill,
} from "@/components/mobile/MobileKit";
import { useOwnerBookings } from "@/hooks/useBookings";
import { useOwnerComplaints } from "@/hooks/useComplaints";
import { useOwnerHostels } from "@/hooks/useHostels";
import { Link } from "@/lib/router-compat";
import { useAuthStore } from "@/store/useAuthStore";

export function OwnerDashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: hostels, isLoading } = useOwnerHostels(user?.id);
  const { data: bookings } = useOwnerBookings();
  const { data: complaints } = useOwnerComplaints();

  if (!user) {
    return (
      <AppScreen>
        <AppHeader title="Owner" />
        <EmptyState
          icon={Building2}
          title="Sign in as an owner"
          body="Manage your listings, bookings and complaints."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      </AppScreen>
    );
  }

  const pending = (bookings ?? []).filter((b) => b.status === "pending");
  const openComplaints = (complaints ?? []).filter((c: any) => c.status !== "resolved");
  const revenue = (bookings ?? [])
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.monthly_rent ?? 0), 0);
  const avgRating =
    (hostels ?? []).length > 0
      ? (hostels ?? []).reduce((s, h) => s + Number(h.rating ?? 0), 0) / (hostels ?? []).length
      : 0;

  return (
    <AppScreen>
      <AppHeader title="Dashboard" subtitle={`Hi, ${user.name?.split(" ")[0] || "owner"}`} />

      <ScreenSection>
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            tone="primary"
            icon={IndianRupee}
            label="Confirmed monthly revenue"
            value={`₹${revenue.toLocaleString("en-IN")}`}
          />
          <StatTile icon={Building2} label="Active listings" value={hostels?.length ?? 0} />
          <StatTile icon={CalendarCheck} label="Pending requests" value={pending.length} />
          <StatTile icon={Star} label="Average rating" value={avgRating.toFixed(1)} />
        </div>
      </ScreenSection>

      <ScreenSection title="Manage">
        <ListGroup>
          <ListRow icon={Building2} title="My hostels" subtitle={`${hostels?.length ?? 0} listings — rooms, beds, location`} to="/owner/hostels" />
          <ListRow
            icon={CalendarCheck}
            title="Booking requests"
            subtitle={`${pending.length} awaiting review`}
            to="/owner/bookings"
          />
          <ListRow
            icon={MessageSquare}
            title="Chats"
            subtitle="Private conversations with students"
            to="/owner/chats"
          />
          <ListRow
            icon={FileText}
            title="Agreements & payments"
            subtitle="Create, sign, share PDFs"
            to="/owner/agreements"
          />
          <ListRow
            icon={MessageSquareWarning}
            title="Complaints"
            subtitle={`${openComplaints.length} open`}
            to="/owner/complaints"
          />
          <ListRow icon={BarChart3} title="Analytics" subtitle="Views, revenue, trends" to="/owner/analytics" />
        </ListGroup>
      </ScreenSection>

      <ScreenSection title="Account">
        <ListGroup>
          <ListRow
            icon={ShieldCheck}
            title="Owner verification"
            subtitle="Documents, status and badge"
            to="/owner/verification"
          />
          <ListRow icon={UserCog} title="Owner profile" subtitle="Edit name, phone and photo" to="/profile" />
        </ListGroup>
      </ScreenSection>

      <ScreenSection
        title="Latest requests"
        action={
          <Link to="/owner/bookings" className="text-[13px] font-bold text-primary">
            See all
          </Link>
        }
        className="pb-8"
      >
        {isLoading ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (bookings ?? []).length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No requests yet"
            body="Add a listing and students will start reaching out."
            action={<AppButton to="/owner/hostels">Add a hostel</AppButton>}
          />
        ) : (
          <div className="space-y-3">
            {(bookings ?? []).slice(0, 4).map((b) => (
              <div key={b.id} className="rounded-3xl bg-app-surface p-4 shadow-app-card">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                      {b.student_name}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {b.hostel?.name} · {b.room_type}
                    </p>
                  </div>
                  <StatusPill status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScreenSection>
    </AppScreen>
  );
}
