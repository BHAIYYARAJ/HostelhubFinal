import { createFileRoute } from "@tanstack/react-router";

import OwnerDashboard from "@/components/desktop/OwnerDashboard";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { OwnerAgreementsScreen } from "@/components/mobile/screens/owner/OwnerAgreementsScreen";

export const Route = createFileRoute("/owner/agreements")({
  head: () => ({
    meta: [
      { title: "Rental agreements — HostelHub owners" },
      { name: "description", content: "Draft, sign and share rental agreements with your student tenants." },
      { property: "og:title", content: "Rental agreements — HostelHub owners" },
      { property: "og:description", content: "Draft, sign and share rental agreements with your student tenants." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MobileGate
      mobile={
        <MobileShell variant="owner">
          <OwnerAgreementsScreen />
        </MobileShell>
      }
      desktop={<OwnerDashboard />}
    />
  );
}
