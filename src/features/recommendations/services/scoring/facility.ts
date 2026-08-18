import type { DbHostel } from "@/hooks/useHostels";
import type { StudentPreference } from "../../types";

function has(list: string[] | null | undefined, ...needles: string[]): boolean {
  if (!list) return false;
  const hay = list.map((x) => x.toLowerCase());
  return needles.some((n) => hay.some((x) => x.includes(n)));
}

export function scoreFacility(h: DbHostel, p: StudentPreference): number {
  const required: boolean[] = [];
  if (p.wifi_required) required.push(has(h.facilities, "wifi", "internet"));
  if (p.laundry_required) required.push(has(h.facilities, "laundry"));
  if (p.parking_required) required.push(has(h.facilities, "parking"));
  const requiredScore =
    required.length === 0 ? 1 : required.filter(Boolean).length / required.length;
  const bonusPool = ["ac", "gym", "study", "mess", "kitchen", "hot water"];
  const bonus =
    bonusPool.filter((b) => has(h.facilities, b)).length / bonusPool.length;
  return Math.min(1, requiredScore * 0.75 + bonus * 0.25);
}