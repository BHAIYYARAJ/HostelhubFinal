import { createFileRoute } from "@tanstack/react-router";

import { AssistantScreen } from "@/components/mobile/screens/AssistantScreen";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI assistant — HostelHub" },
      { name: "description", content: "Ask the HostelHub assistant about hostels, rent, facilities and bookings." },
      { property: "og:title", content: "AI assistant — HostelHub" },
      { property: "og:description", content: "Ask the HostelHub assistant about hostels, rent, facilities and bookings." },
    ],
  }),
  component: Page,
});

function Page() {
  return <AssistantScreen />;
}
