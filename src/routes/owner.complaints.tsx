import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerComplaintsScreen } from "@/components/mobile/screens/owner/OwnerComplaintsScreen";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";

export const Route = createFileRoute("/owner/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints — HostelHub owners" },
      { name: "description", content: "Resolve maintenance complaints raised by residents of your hostels." },
      { property: "og:title", content: "Complaints — HostelHub owners" },
      { property: "og:description", content: "Resolve maintenance complaints raised by residents of your hostels." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="owner"><OwnerComplaintsScreen /></MobileShell>} desktop={<OwnerDashboard />} />;
}
