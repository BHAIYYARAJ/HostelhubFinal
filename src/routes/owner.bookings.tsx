import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerBookingsScreen } from "@/components/mobile/screens/owner/OwnerBookingsScreen";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";

export const Route = createFileRoute("/owner/bookings")({
  head: () => ({
    meta: [
      { title: "Booking requests — HostelHub owners" },
      { name: "description", content: "Approve, reject and track booking requests from students." },
      { property: "og:title", content: "Booking requests — HostelHub owners" },
      { property: "og:description", content: "Approve, reject and track booking requests from students." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="owner"><OwnerBookingsScreen /></MobileShell>} desktop={<OwnerDashboard />} />;
}
