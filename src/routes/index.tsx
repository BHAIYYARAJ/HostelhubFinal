import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { HomeScreen } from "@/components/mobile/screens/HomeScreen";
import Index from "@/components/desktop/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostelHub — Student Accommodation Solution" },
      { name: "description", content: "Browse verified hostels and PGs near your college with real prices, photos and instant booking." },
      { property: "og:title", content: "HostelHub — Student Accommodation Solution" },
      { property: "og:description", content: "Browse verified hostels and PGs near your college with real prices, photos and instant booking." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><HomeScreen /></MobileShell>} desktop={<Index />} />;
}
