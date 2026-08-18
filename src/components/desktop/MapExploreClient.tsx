import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Leaflet touches `window` at module scope, so this page can only be imported
// in the browser.
const MapExplore = lazy(() => import("@/components/desktop/MapExplore"));

function Fallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function MapExploreClient() {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <MapExplore />
      </Suspense>
    </ClientOnly>
  );
}
