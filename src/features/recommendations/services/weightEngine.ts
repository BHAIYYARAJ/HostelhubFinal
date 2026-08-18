import type { StudentPreference, Weights } from "../types";

/**
 * Turn importance ratings (1..5) into normalized weights per sub-score.
 * Facility importance also drives food/internet weights so raising "facilities"
 * has a coherent effect. Trust/rating/availability get a small baseline.
 */
export function generateWeights(
  pref: StudentPreference,
  learnedAdjustments: Partial<Weights> = {}
): Weights {
  const raw: Weights = {
    budget: pref.importance_budget,
    distance: pref.importance_distance,
    safety: pref.importance_safety,
    facility: pref.importance_facility,
    food: Math.max(1, pref.importance_facility - 1),
    internet: pref.wifi_required ? pref.importance_facility : 1,
    trust: 2,
    rating: 2,
    availability: 2,
    verified: 2,
    popularity: 1.5,
  };

  // Merge learned offsets (future ML hook).
  (Object.keys(raw) as (keyof Weights)[]).forEach((k) => {
    raw[k] = Math.max(0, raw[k] + (learnedAdjustments[k] ?? 0));
  });

  const sum = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const normalized = {} as Weights;
  (Object.keys(raw) as (keyof Weights)[]).forEach((k) => {
    normalized[k] = raw[k] / sum;
  });
  return normalized;
}