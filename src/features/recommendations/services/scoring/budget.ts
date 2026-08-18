import type { DbHostel } from "@/hooks/useHostels";
import type { StudentPreference } from "../../types";

export function scoreBudget(h: DbHostel, p: StudentPreference): number {
  const price = h.price ?? 0;
  if (price <= 0) return 0.5;
  if (price >= p.budget_min && price <= p.budget_max) return 1;
  const range = Math.max(1, p.budget_max - p.budget_min);
  const dist = price < p.budget_min ? p.budget_min - price : price - p.budget_max;
  return Math.max(0, 1 - dist / range);
}