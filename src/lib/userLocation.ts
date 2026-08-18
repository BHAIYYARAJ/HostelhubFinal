export type LatLng = [number, number];

export interface LocationFailure {
  code: "unsupported" | "denied" | "unavailable" | "timeout";
  message: string;
}

const MESSAGES: Record<LocationFailure["code"], string> = {
  unsupported:
    "Your browser doesn't support location. Search by city, area or college instead.",
  denied:
    "Location permission denied. Enable location access in your browser, or search by city, area or college instead.",
  unavailable:
    "We couldn't get your location right now. Try again, or search by city, area or college.",
  timeout:
    "Getting your location took too long. Try again, or search by city, area or college.",
};

/**
 * Requests the device's real GPS position. Never falls back to a hardcoded
 * or default location — callers must handle the rejection and offer manual search.
 */
export function requestUserLocation(
  opts: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
): Promise<{ coords: LatLng; accuracyMeters: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({ code: "unsupported", message: MESSAGES.unsupported } as LocationFailure);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          coords: [pos.coords.latitude, pos.coords.longitude],
          accuracyMeters: pos.coords.accuracy,
        }),
      (err) => {
        const code: LocationFailure["code"] =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
            ? "timeout"
            : "unavailable";
        reject({ code, message: MESSAGES[code] } as LocationFailure);
      },
      opts
    );
  });
}
