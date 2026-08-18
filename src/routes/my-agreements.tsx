import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AgreementsScreen } from "@/components/mobile/screens/AgreementsScreen";
import MyAgreements from "@/components/desktop/MyAgreements";

export const Route = createFileRoute("/my-agreements")({
  head: () => ({
    meta: [
      { title: "My agreements — HostelHub" },
      { name: "description", content: "View and download the rental agreements shared by your hostel owner." },
      { property: "og:title", content: "My agreements — HostelHub" },
      { property: "og:description", content: "View and download the rental agreements shared by your hostel owner." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><AgreementsScreen /></MobileShell>} desktop={<MyAgreements />} />;
}
