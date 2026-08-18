import type { DbHostel } from "@/hooks/useHostels";
import type {
  EngineResult,
  HostelSafetyScore,
  OwnerTrustScore,
  ScoredHostel,
  StudentPreference,
  SubScores,
  Weights,
} from "../types";
import { estimateMinutes } from "@/lib/hostelCoords";
import { generateWeights } from "./weightEngine";
import { scoreBudget } from "./scoring/budget";
import { scoreDistance, realDistanceKm } from "./scoring/distance";
import { scoreFacility } from "./scoring/facility";
import { scoreSafety } from "./scoring/safety";
import { scoreFood } from "./scoring/food";
import { scoreInternet } from "./scoring/internet";
import { scoreTrust } from "./scoring/trust";
import { scoreRating } from "./scoring/rating";
import { scoreAvailability } from "./scoring/availability";
import { buildExplanation } from "./explanationBuilder";

function preferenceCompleteness(p: StudentPreference): number {
  let filled = 0;
  let total = 0;
  const fields: [any, any][] = [
    [p.budget_max > 0, true],
    [p.preferred_distance_km > 0, true],
    [p.room_type !== "any", true],
    [p.food_preference !== "any", true],
    [p.gender_preference !== "any", true],
  ];
  fields.forEach(([f]) => {
    total++;
    if (f) filled++;
  });
  return total ? filled / total : 0.5;
}

function dataCompleteness(h: DbHostel, safety?: HostelSafetyScore | null, trust?: OwnerTrustScore | null): number {
  let filled = 0;
  let total = 0;
  const bits = [
    !!h.price,
    !!h.distance_from_college,
    (h.facilities?.length ?? 0) > 0,
    !!safety,
    !!trust,
    (h.review_count ?? 0) > 0,
  ];
  bits.forEach((b) => {
    total++;
    if (b) filled++;
  });
  return total ? filled / total : 0.5;
}

function genderMatch(h: DbHostel, p: StudentPreference): boolean {
  if (p.gender_preference === "any") return true;
  if (p.gender_preference === "co-ed") return h.type === "co-ed";
  return h.type === p.gender_preference || h.type === "co-ed";
}

export interface EngineInput {
  preference: StudentPreference;
  hostels: DbHostel[];
  safetyByHostel: Map<string, HostelSafetyScore>;
  trustByOwner: Map<string, OwnerTrustScore>;
  learnedAdjustments?: Partial<Weights>;
  /** Minimum number of matches before the radius stops expanding. */
  minResults?: number;
}

export function runRecommendationEngine(input: EngineInput): EngineResult {
  const { preference, hostels, safetyByHostel, trustByOwner, learnedAdjustments } = input;
  const weights = generateWeights(preference, learnedAdjustments);
  const prefCompleteness = preferenceCompleteness(preference);

  const genderPool = hostels.filter((h) => genderMatch(h, preference));

  const hasPin =
    preference.preferred_lat != null && preference.preferred_lng != null;
  // Exact, student-selected radius in km (minimum 50 km). No scaling, no hidden expansion —
  // the filtering radius is exactly what the map circle draws.
  const baseRadius = Math.max(50, preference.preferred_radius_km || 50);

  // Nearby-first: keep only hostels inside the radius, expanding step-by-step
  // (never showing far-away hostels while closer ones exist).
  let pool = genderPool;
  let appliedRadiusKm: number | null = null;
  const expanded = false;
  if (hasPin) {
    const geocoded = genderPool
      .map((h) => ({ h, km: realDistanceKm(h, preference) }))
      .filter((x) => x.km != null);
    appliedRadiusKm = baseRadius;
    pool = geocoded.filter((x) => (x.km as number) <= baseRadius).map((x) => x.h);
  }

  const scored: ScoredHostel[] = pool.map((h) => {
      const safety = safetyByHostel.get(h.id) ?? null;
      const trust = h.owner_id ? trustByOwner.get(h.owner_id) ?? null : null;
      const distanceKm = realDistanceKm(h, preference);
      const sub: SubScores = {
        budget: scoreBudget(h, preference),
        distance: scoreDistance(h, preference),
        facility: scoreFacility(h, preference),
        safety: scoreSafety(safety),
        food: scoreFood(h, preference),
        internet: scoreInternet(h, preference),
        trust: scoreTrust(trust),
        rating: scoreRating(h),
        availability: scoreAvailability(h),
        verified: trust?.verified ? 1 : 0,
        popularity: Math.min(1, (h.review_count ?? 0) / 15),
      };
      const overallNorm = (Object.keys(sub) as (keyof SubScores)[]).reduce(
        (acc, k) => acc + sub[k] * weights[k],
        0
      );
      const overall = Math.round(overallNorm * 100);
      const confidence = Number(
        (dataCompleteness(h, safety, trust) * prefCompleteness).toFixed(2)
      );
      const explanation = buildExplanation({
        hostel: h,
        pref: preference,
        sub,
        safety,
        trust,
        distanceKm,
      });
      return {
        hostel: h,
        overall,
        confidence,
        subScores: sub,
        weights,
        explanation,
        safety: safety ?? undefined,
        trust: trust ?? undefined,
        distanceKm,
        eta:
          distanceKm == null
            ? null
            : {
                walk: estimateMinutes(distanceKm, "walk"),
                bike: estimateMinutes(distanceKm, "bike"),
                car: estimateMinutes(distanceKm, "car"),
                transit: estimateMinutes(distanceKm, "transit"),
              },
      };
    });

  return {
    items: scored.sort((a, b) => b.overall - a.overall),
    appliedRadiusKm,
    expanded,
  };
}