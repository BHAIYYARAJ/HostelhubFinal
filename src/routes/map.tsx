import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ExploreScreen } from "@/components/mobile/screens/ExploreScreen";
import MapExploreClient from "@/components/desktop/MapExploreClient";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Explore hostels on the map — HostelHub" },
      { name: "description", content: "Explore hostels on an interactive map and see which stays sit closest to your campus." },
      { property: "og:title", content: "Explore hostels on the map — HostelHub" },
      { property: "og:description", content: "Explore hostels on an interactive map and see which stays sit closest to your campus." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><ExploreScreen /></MobileShell>} desktop={<MapExploreClient />} />;
}
