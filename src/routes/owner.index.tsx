import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerDashboardScreen } from "@/components/mobile/screens/owner/OwnerDashboardScreen";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";

export const Route = createFileRoute("/owner/")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — HostelHub" },
      { name: "description", content: "Overview of your listings, bookings, revenue and open complaints." },
      { property: "og:title", content: "Owner dashboard — HostelHub" },
      { property: "og:description", content: "Overview of your listings, bookings, revenue and open complaints." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="owner"><OwnerDashboardScreen /></MobileShell>} desktop={<OwnerDashboard />} />;
}
