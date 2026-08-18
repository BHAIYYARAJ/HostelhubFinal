import type { ScoredHostel } from "../types";

export type ComparisonMetric =
  | "price"
  | "distance"
  | "facility"
  | "safety"
  | "food"
  | "internet"
  | "laundry"
  | "parking"
  | "trust"
  | "overall";

function parseKm(s?: string | null): number {
  if (!s) return Number.POSITIVE_INFINITY;
  const m = s.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : Number.POSITIVE_INFINITY;
}

function has(list: string[] | null | undefined, needle: string): boolean {
  return !!list?.some((f) => f.toLowerCase().includes(needle));
}

export function compareHostels(items: ScoredHostel[]) {
  const winners: Partial<Record<ComparisonMetric, string>> = {};
  if (!items.length) return { winners, overallWinnerId: null as string | null };

  const bestBy = <T,>(sel: (i: ScoredHostel) => T, better: (a: T, b: T) => boolean) => {
    return items.reduce((best, cur) =>
      better(sel(cur), sel(best)) ? cur : best
    ).hostel.id;
  };

  winners.price = bestBy((i) => i.hostel.price, (a, b) => a < b);
  winners.distance = bestBy(
    (i) => parseKm(i.hostel.distance_from_college),
    (a, b) => a < b
  );
  winners.facility = bestBy((i) => i.subScores.facility, (a, b) => a > b);
  winners.safety = bestBy((i) => i.subScores.safety, (a, b) => a > b);
  winners.food = bestBy((i) => i.subScores.food, (a, b) => a > b);
  winners.internet = bestBy((i) => i.subScores.internet, (a, b) => a > b);
  winners.laundry = bestBy(
    (i) => (has(i.hostel.facilities, "laundry") ? 1 : 0),
    (a, b) => a > b
  );
  winners.parking = bestBy(
    (i) => (has(i.hostel.facilities, "parking") ? 1 : 0),
    (a, b) => a > b
  );
  winners.trust = bestBy((i) => i.subScores.trust, (a, b) => a > b);
  winners.overall = bestBy((i) => i.overall, (a, b) => a > b);
  return { winners, overallWinnerId: winners.overall ?? null };
}