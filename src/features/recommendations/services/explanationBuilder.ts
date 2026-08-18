import type { DbHostel } from "@/hooks/useHostels";
import type {
  Explanation,
  HostelSafetyScore,
  OwnerTrustScore,
  StudentPreference,
  SubScores,
} from "../types";

const LABELS: Record<keyof SubScores, string> = {
  budget: "Budget",
  distance: "Distance",
  facility: "Facilities",
  safety: "Safety",
  food: "Food",
  internet: "Internet",
  trust: "Owner trust",
  rating: "Rating",
  availability: "Availability",
  verified: "Verified owner",
  popularity: "Reviews",
};

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

export function buildExplanation(params: {
  hostel: DbHostel;
  pref: StudentPreference;
  sub: SubScores;
  safety?: HostelSafetyScore | null;
  trust?: OwnerTrustScore | null;
  distanceKm?: number | null;
}): Explanation {
  const { hostel, pref, sub, safety, trust, distanceKm } = params;
  const reasons: string[] = [];

  if (distanceKm != null && pref.preferred_location) {
    reasons.push(
      `${distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`} from ${pref.preferred_location} — about ${Math.max(1, Math.round((distanceKm / 25) * 60))} min by bike.`
    );
  }

  if (sub.budget >= 0.8)
    reasons.push(`Priced at ₹${hostel.price} — well within your ₹${pref.budget_min}-${pref.budget_max} budget.`);
  else if (sub.budget < 0.4)
    reasons.push(`Above your target budget of ₹${pref.budget_max}.`);

  if (sub.distance >= 0.8)
    reasons.push(`Within ${pref.preferred_distance_km} km of college.`);

  if (sub.facility >= 0.7)
    reasons.push("Covers most of the facilities you asked for.");

  if (safety && sub.safety >= 0.7)
    reasons.push(`Safety rated ${safety.level} (${Math.round(safety.score)}/100).`);

  if (trust && trust.verified)
    reasons.push("Owner is identity-verified on HostelHub.");

  if (sub.rating >= 0.8 && (hostel.review_count ?? 0) > 0)
    reasons.push(`Highly rated by past residents (${hostel.rating.toFixed(1)}★).`);

  if (sub.availability > 0 && sub.availability < 0.2)
    reasons.push("Only a few rooms left — book soon.");
  else if (sub.availability >= 0.6) reasons.push("Rooms currently available.");

  if ((hostel.review_count ?? 0) >= 5)
    reasons.push(`Backed by ${hostel.review_count} student reviews.`);

  const ranked = (Object.entries(sub) as [keyof SubScores, number][]) //
    .sort((a, b) => b[1] - a[1]);
  const bestFor = ranked.slice(0, 2).map(([k]) => LABELS[k]);

  const matches: Explanation["matches"] = {};
  (Object.keys(sub) as (keyof SubScores)[]).forEach((k) => {
    matches[k] = pct(sub[k]);
  });

  return { reasons, bestFor, matches };
}