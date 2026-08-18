import { createFileRoute } from "@tanstack/react-router";

import OwnerDashboard from "@/components/desktop/OwnerDashboard";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerVerificationScreen } from "@/components/mobile/screens/owner/OwnerVerificationScreen";

export const Route = createFileRoute("/owner/verification")({
  head: () => ({
    meta: [
      { title: "Owner verification — HostelHub" },
      { name: "description", content: "Upload documents and track your verified owner badge status." },
      { property: "og:title", content: "Owner verification — HostelHub" },
      { property: "og:description", content: "Upload documents and track your verified owner badge status." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MobileGate
      mobile={
        <MobileShell variant="owner">
          <OwnerVerificationScreen />
        </MobileShell>
      }
      desktop={<OwnerDashboard />}
    />
  );
}
