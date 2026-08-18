import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Pulls in the Leaflet-based recommendation map, which touches `window` at
// module scope, so it must stay browser-only.
const SmartRecommendations = lazy(
  () => import("@/components/desktop/SmartRecommendations"),
);

function Fallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function SmartRecommendationsClient() {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <SmartRecommendations />
      </Suspense>
    </ClientOnly>
  );
}
