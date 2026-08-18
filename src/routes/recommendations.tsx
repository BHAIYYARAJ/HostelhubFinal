import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { SmartPicksScreen } from "@/components/mobile/screens/SmartPicksScreen";
import SmartRecommendationsClient from "@/components/desktop/SmartRecommendationsClient";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Smart Picks — HostelHub" },
      { name: "description", content: "Personalised hostel recommendations scored on budget, distance, safety and facilities." },
      { property: "og:title", content: "Smart Picks — HostelHub" },
      { property: "og:description", content: "Personalised hostel recommendations scored on budget, distance, safety and facilities." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><SmartPicksScreen /></MobileShell>} desktop={<SmartRecommendationsClient />} />;
}
