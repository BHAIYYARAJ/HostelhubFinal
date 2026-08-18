import { createFileRoute } from "@tanstack/react-router";

import ComparePage from "@/components/desktop/ComparePage";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { CompareScreen } from "@/components/mobile/screens/CompareScreen";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare hostels — HostelHub" },
      { name: "description", content: "Compare shortlisted hostels side by side on rent, distance and facilities." },
      { property: "og:title", content: "Compare hostels — HostelHub" },
      { property: "og:description", content: "Compare shortlisted hostels side by side on rent, distance and facilities." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MobileGate
      mobile={
        <MobileShell>
          <CompareScreen />
        </MobileShell>
      }
      desktop={<ComparePage />}
    />
  );
}
