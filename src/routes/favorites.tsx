import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { SavedScreen } from "@/components/mobile/screens/SavedScreen";
import Favorites from "@/components/desktop/Favorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved hostels — HostelHub" },
      { name: "description", content: "Your shortlisted hostels, saved for quick comparison later." },
      { property: "og:title", content: "Saved hostels — HostelHub" },
      { property: "og:description", content: "Your shortlisted hostels, saved for quick comparison later." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><SavedScreen /></MobileShell>} desktop={<Favorites />} />;
}
