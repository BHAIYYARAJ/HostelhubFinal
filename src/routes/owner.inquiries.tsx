import { createFileRoute } from "@tanstack/react-router";

import OwnerDashboard from "@/components/desktop/OwnerDashboard";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerInquiriesScreen } from "@/components/mobile/screens/owner/OwnerInquiriesScreen";

export const Route = createFileRoute("/owner/inquiries")({
  head: () => ({
    meta: [
      { title: "Student inquiries — HostelHub owners" },
      { name: "description", content: "Read and reply to student inquiries about your hostel listings." },
      { property: "og:title", content: "Student inquiries — HostelHub owners" },
      { property: "og:description", content: "Read and reply to student inquiries about your hostel listings." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MobileGate
      mobile={
        <MobileShell variant="owner">
          <OwnerInquiriesScreen />
        </MobileShell>
      }
      desktop={<OwnerDashboard />}
    />
  );
}
