import type { DbHostel } from "@/hooks/useHostels";

export function scoreAvailability(h: DbHostel): number {
  const avail = h.available_rooms ?? 0;
  const total = h.total_rooms ?? 0;
  if (avail <= 0) return 0;
  if (total <= 0) return avail > 0 ? 0.7 : 0;
  return Math.min(1, avail / total);
}