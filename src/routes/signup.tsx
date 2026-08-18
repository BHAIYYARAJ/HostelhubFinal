import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { AuthScreen } from "@/components/mobile/screens/AuthScreen";
import Signup from "@/components/desktop/Signup";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — HostelHub" },
      { name: "description", content: "Create a free HostelHub account as a student or hostel owner." },
      { property: "og:title", content: "Create account — HostelHub" },
      { property: "og:description", content: "Create a free HostelHub account as a student or hostel owner." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<AuthScreen mode="signup" />} desktop={<Signup />} />;
}
