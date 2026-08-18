import type { DbHostel } from "@/hooks/useHostels";
import type { StudentPreference } from "../../types";
import { haversineKm, getHostelCoords } from "@/lib/hostelCoords";

function parseKm(s?: string | null): number | null {
  if (!s) return null;
  const m = s.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

export function scoreDistance(h: DbHostel, p: StudentPreference): number {
  const km = realDistanceKm(h, p) ?? parseKm(h.distance_from_college);
  if (km == null) return 0.5;
  if (km <= p.preferred_distance_km) return 1;
  const over = km - p.preferred_distance_km;
  return Math.max(0, 1 - over / (p.preferred_distance_km * 2 || 1));
}

/** Real great-circle distance between the hostel and the student's preferred college/area. */
export function realDistanceKm(h: DbHostel, p: StudentPreference): number | null {
  const coords = getHostelCoords(h);
  if (!coords) return null;
  if (p.preferred_lat == null || p.preferred_lng == null) return null;
  return haversineKm([p.preferred_lat, p.preferred_lng], coords);
}