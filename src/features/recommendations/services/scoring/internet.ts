import type { DbHostel } from "@/hooks/useHostels";
import type { StudentPreference } from "../../types";

export function scoreInternet(h: DbHostel, p: StudentPreference): number {
  const has = (h.facilities ?? []).some((f) => /wi\s?-?fi|internet/i.test(f));
  if (p.wifi_required) return has ? 1 : 0;
  return has ? 1 : 0.5;
}