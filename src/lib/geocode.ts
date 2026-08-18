// Free OpenStreetMap Nominatim geocoding — no API key required.
// Usage policy: max 1 req/sec, must send a descriptive User-Agent (browser sets Referer instead).
export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const results = await searchPlaces(query, 1);
  return results[0] ?? null;
}

/** Autocomplete-style place search (Nominatim). Returns up to `limit` matches. */
export async function searchPlaces(query: string, limit = 5): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    return data.map((d) => ({
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
      displayName: d.display_name,
    }));
  } catch {
    return [];
  }
}