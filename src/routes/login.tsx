import { createFileRoute } from "@tanstack/react-router";

import { MobileGate } from "@/components/mobile/MobileGate";
import { AuthScreen } from "@/components/mobile/screens/AuthScreen";
import Login from "@/components/desktop/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — HostelHub" },
      { name: "description", content: "Sign in to HostelHub to manage your bookings, agreements and saved hostels." },
      { property: "og:title", content: "Sign in — HostelHub" },
      { property: "og:description", content: "Sign in to HostelHub to manage your bookings, agreements and saved hostels." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MobileGate mobile={<AuthScreen mode="login" />} desktop={<Login />} />;
}
