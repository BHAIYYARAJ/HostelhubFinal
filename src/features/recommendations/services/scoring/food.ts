import type { DbHostel } from "@/hooks/useHostels";
import type { StudentPreference } from "../../types";

export function scoreFood(h: DbHostel, p: StudentPreference): number {
  if (p.food_preference === "any") return 1;
  const list = (h.facilities ?? []).map((x) => x.toLowerCase());
  const hasVeg = list.some((x) => x.includes("veg") || x.includes("mess") || x.includes("food"));
  const hasNonVeg = list.some((x) => x.includes("non-veg") || x.includes("non veg"));
  if (p.food_preference === "veg") return hasVeg ? 1 : hasNonVeg ? 0.4 : 0.6;
  if (p.food_preference === "non-veg") return hasNonVeg ? 1 : hasVeg ? 0.6 : 0.5;
  return 0.6;
}