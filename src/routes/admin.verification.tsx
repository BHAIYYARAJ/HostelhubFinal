import { createFileRoute } from "@tanstack/react-router";

import AdminVerification from "@/components/desktop/AdminVerification";

export const Route = createFileRoute("/admin/verification")({
  head: () => ({
    meta: [
      { title: "Verification queue — HostelHub admin" },
      { name: "description", content: "Review and verify hostel listings submitted by owners." },
      { property: "og:title", content: "Verification queue — HostelHub admin" },
      { property: "og:description", content: "Review and verify hostel listings submitted by owners." },
    ],
  }),
  component: Page,
});

function Page() {
  return <AdminVerification />;
}
