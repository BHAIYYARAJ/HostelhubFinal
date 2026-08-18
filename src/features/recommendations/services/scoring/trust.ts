import type { OwnerTrustScore } from "../../types";

export function scoreTrust(trust?: OwnerTrustScore | null): number {
  if (!trust) return 0.5;
  return Math.min(1, Math.max(0, trust.score / 100));
}

export function computeTrust(t: Omit<OwnerTrustScore, "score">): number {
  const rating = Math.min(1, (t.avg_rating || 0) / 5) * 30;
  const verified = t.verified ? 20 : 0;
  const bookings = Math.min(1, (t.bookings_completed || 0) / 50) * 15;
  const responseIdealMin = 30;
  const response = t.response_minutes > 0
    ? Math.min(1, responseIdealMin / t.response_minutes) * 15
    : 7.5;
  const complaints = Math.max(0, 10 - Math.min(10, t.complaints_count));
  const tenure = Math.min(1, (t.months_on_platform || 0) / 24) * 10;
  return Math.round(rating + verified + bookings + response + complaints + tenure);
}