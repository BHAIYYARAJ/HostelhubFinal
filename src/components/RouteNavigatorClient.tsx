import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import type RouteNavigatorType from "@/components/RouteNavigator";

// Leaflet reads `window` at module scope, so keep this map browser-only.
const RouteNavigator = lazy(() => import("@/components/RouteNavigator"));

function Fallback() {
  return (
    <div className="grid h-64 place-items-center rounded-2xl bg-muted">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export default function RouteNavigatorClient(
  props: ComponentProps<typeof RouteNavigatorType>,
) {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <RouteNavigator {...props} />
      </Suspense>
    </ClientOnly>
  );
}
