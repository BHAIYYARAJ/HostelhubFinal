import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { BookingsScreen } from "@/components/mobile/screens/BookingsScreen";
import MyBookings from "@/components/desktop/MyBookings";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — HostelHub" },
      { name: "description", content: "Track the status of every hostel booking request you have made." },
      { property: "og:title", content: "My bookings — HostelHub" },
      { property: "og:description", content: "Track the status of every hostel booking request you have made." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><BookingsScreen /></MobileShell>} desktop={<MyBookings />} />;
}
