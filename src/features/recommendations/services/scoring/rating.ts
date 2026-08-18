import type { DbHostel } from "@/hooks/useHostels";

export function scoreRating(h: DbHostel): number {
  const r = h.rating ?? 0;
  const rc = h.review_count ?? 0;
  const base = Math.max(0, Math.min(1, r / 5));
  const confidence = Math.min(1, rc / 20);
  return base * (0.6 + 0.4 * confidence);
}