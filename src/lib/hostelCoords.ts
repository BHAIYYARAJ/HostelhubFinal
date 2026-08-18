// Coordinate helpers for hostels. Coordinates always come from the database
// (hostels.latitude / hostels.longitude) — never derived or faked.

export const cityCoords: Record<string, [number, number]> = {
  "All Cities": [20.5937, 78.9629],
  Bangalore: [12.9716, 77.5946],
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  Chennai: [13.0827, 80.2707],
  Noida: [28.5355, 77.391],
  Kolkata: [22.5726, 88.3639],
  Delhi: [28.6139, 77.209],
  Hyderabad: [17.385, 78.4867],
};

/**
 * Returns the hostel's real stored coordinates, or null when the listing has
 * not been geocoded yet. Callers must handle the null case explicitly.
 */
export function getHostelCoords(h: {
  latitude?: number | null;
  longitude?: number | null;
}): [number, number] | null {
  const lat = h?.latitude;
  const lng = h?.longitude;
  if (lat == null || lng == null) return null;
  if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return null;
  return [Number(lat), Number(lng)];
}

export function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function estimateMinutes(km: number, mode: "walk" | "bike" | "car" | "transit") {
  const speeds = { walk: 5, bike: 25, car: 40, transit: 22 } as const;
  return Math.max(1, Math.round((km / speeds[mode]) * 60));
}
