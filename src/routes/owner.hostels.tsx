import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerHostelsScreen } from "@/components/mobile/screens/owner/OwnerHostelsScreen";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";

export const Route = createFileRoute("/owner/hostels")({
  head: () => ({
    meta: [
      { title: "My hostels — HostelHub owners" },
      { name: "description", content: "Create, edit and publish the hostel listings you manage on HostelHub." },
      { property: "og:title", content: "My hostels — HostelHub owners" },
      { property: "og:description", content: "Create, edit and publish the hostel listings you manage on HostelHub." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="owner"><OwnerHostelsScreen /></MobileShell>} desktop={<OwnerDashboard />} />;
}
