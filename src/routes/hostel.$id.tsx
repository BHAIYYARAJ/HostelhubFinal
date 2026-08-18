import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { HostelDetailScreen } from "@/components/mobile/screens/HostelDetailScreen";
import HostelDetail from "@/components/desktop/HostelDetail";

export const Route = createFileRoute("/hostel/$id")({
  head: () => ({
    meta: [
      { title: "Hostel details — HostelHub" },
      { name: "description", content: "Photos, rent, facilities, reviews and booking for this student hostel." },
      { property: "og:title", content: "Hostel details — HostelHub" },
      { property: "og:description", content: "Photos, rent, facilities, reviews and booking for this student hostel." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<HostelDetailScreen />} desktop={<HostelDetail />} />;
}
