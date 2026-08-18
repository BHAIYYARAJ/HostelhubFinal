import { useMemo } from "react";
import { useComparisonStore } from "../store/useComparisonStore";
import { useRecommendations } from "./useRecommendations";

export function useComparison() {
  const { recommendations } = useRecommendations();
  const ids = useComparisonStore((s) => s.ids);
  const items = useMemo(
    () =>
      ids
        .map((id) => recommendations.find((r) => r.hostel.id === id))
        .filter((x): x is NonNullable<typeof x> => !!x),
    [ids, recommendations]
  );
  return { items, ids };
}