import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ComplaintsScreen } from "@/components/mobile/screens/ComplaintsScreen";
import MyComplaints from "@/components/desktop/MyComplaints";

export const Route = createFileRoute("/my-complaints")({
  head: () => ({
    meta: [
      { title: "My complaints — HostelHub" },
      { name: "description", content: "Raise and follow up on maintenance complaints for your hostel." },
      { property: "og:title", content: "My complaints — HostelHub" },
      { property: "og:description", content: "Raise and follow up on maintenance complaints for your hostel." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><ComplaintsScreen /></MobileShell>} desktop={<MyComplaints />} />;
}
