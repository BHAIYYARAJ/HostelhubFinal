import { createFileRoute } from "@tanstack/react-router";

import PreferencesPage from "@/components/desktop/PreferencesPage";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Stay preferences — HostelHub" },
      { name: "description", content: "Tune budget, distance and facility preferences that power your Smart Picks." },
      { property: "og:title", content: "Stay preferences — HostelHub" },
      { property: "og:description", content: "Tune budget, distance and facility preferences that power your Smart Picks." },
    ],
  }),
  component: Page,
});

function Page() {
  return <PreferencesPage />;
}
