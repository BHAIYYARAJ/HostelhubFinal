import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerAnalyticsScreen } from "@/components/mobile/screens/owner/OwnerAnalyticsScreen";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";

export const Route = createFileRoute("/owner/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — HostelHub owners" },
      { name: "description", content: "Occupancy, revenue and enquiry trends across your hostel listings." },
      { property: "og:title", content: "Analytics — HostelHub owners" },
      { property: "og:description", content: "Occupancy, revenue and enquiry trends across your hostel listings." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="owner"><OwnerAnalyticsScreen /></MobileShell>} desktop={<OwnerDashboard />} />;
}
