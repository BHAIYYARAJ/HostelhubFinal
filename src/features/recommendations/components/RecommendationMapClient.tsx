import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, type ComponentProps } from "react";
import { Loader2 } from "lucide-react";

import type RecommendationMapType from "./RecommendationMap";

// Leaflet touches `window` at module scope, so keep this map browser-only.
const RecommendationMap = lazy(() => import("./RecommendationMap"));

function Fallback() {
  return (
    <div className="grid h-[260px] w-full place-items-center rounded-3xl bg-muted">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export default function RecommendationMapClient(
  props: ComponentProps<typeof RecommendationMapType>,
) {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <RecommendationMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
