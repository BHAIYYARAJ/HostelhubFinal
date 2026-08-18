import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ProfileScreen } from "@/components/mobile/screens/ProfileScreen";
import Profile from "@/components/desktop/Profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — HostelHub" },
      { name: "description", content: "Manage your HostelHub profile, language and account settings." },
      { property: "og:title", content: "Profile — HostelHub" },
      { property: "og:description", content: "Manage your HostelHub profile, language and account settings." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<MobileShell variant="student"><ProfileScreen /></MobileShell>} desktop={<Profile />} />;
}
