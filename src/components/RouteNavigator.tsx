import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Navigation, PersonStanding, Bike, Car, Bus, Loader2,
  MapPin, Clock, Route as RouteIcon, ChevronRight, AlertCircle,
} from "lucide-react";
import { haversineKm, formatDistance, estimateMinutes } from "@/lib/hostelCoords";
import { toast } from "sonner";

type Mode = "walk" | "bike" | "car" | "transit";
type LatLng = [number, number];

interface Props {
  open: boolean;
  onClose: () => void;
  destination: LatLng;
  hostelName: string;
}

const userIcon = new L.DivIcon({
  className: "user-marker",
  html: `<div style="position:relative;width:22px;height:22px;"><div style="position:absolute;inset:-6px;border-radius:50%;background:hsl(0,84%,60%);opacity:.25;animation:rn-pulse 1.6s ease-out infinite;"></div><div style="position:absolute;inset:0;background:hsl(0,84%,60%);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div></div><style>@keyframes rn-pulse{0%{transform:scale(.6);opacity:.6}100%{transform:scale(2.2);opacity:0}}</style>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const hostelIcon = new L.DivIcon({
  className: "hostel-marker",
  html: `<div style="background:hsl(221,83%,53%);color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,.35);"><span style="transform:rotate(45deg);font-size:16px;">🏠</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const poiIcon = (emoji: string) =>
  new L.DivIcon({
    className: "poi-marker",
    html: `<div style="background:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:2px solid hsl(221,83%,53%);box-shadow:0 2px 4px rgba(0,0,0,.2);font-size:13px;">${emoji}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

// Each travel mode uses a dedicated OSRM routing profile so distance, duration
// and turn-by-turn steps genuinely differ per mode.
const OSRM_HOSTS: Record<string, string> = {
  foot: "https://routing.openstreetmap.de/routed-foot",
  bike: "https://routing.openstreetmap.de/routed-bike",
  car: "https://routing.openstreetmap.de/routed-car",
};

const MODES: { id: Mode; label: string; Icon: any; profile: keyof typeof OSRM_HOSTS }[] = [
  { id: "walk", label: "Walk", Icon: PersonStanding, profile: "foot" },
  { id: "bike", label: "Bike", Icon: Bike, profile: "bike" },
  { id: "car", label: "Car", Icon: Car, profile: "car" },
  { id: "transit", label: "Transit", Icon: Bus, profile: "car" },
];

const OSRM_PROFILE_PATH: Record<string, string> = {
  foot: "foot",
  bike: "bike",
  car: "driving",
};

interface RouteData {
  geometry: LatLng[];
  distanceKm: number;
  durationMin: number;
  steps: { text: string; distance: number }[];
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const b = L.latLngBounds(points as any);
    map.fitBounds(b, { padding: [60, 60], maxZoom: 16 });
  }, [points, map]);
  return null;
}

interface POI { id: string; lat: number; lng: number; name: string; kind: string; emoji: string }

const POI_QUERY = `
[out:json][timeout:15];
(
  node["highway"="bus_stop"](around:RADIUS,LAT,LNG);
  node["railway"="station"](around:RADIUS,LAT,LNG);
  node["amenity"~"restaurant|hospital|pharmacy|atm"](around:RADIUS,LAT,LNG);
  node["shop"~"convenience|supermarket|grocery"](around:RADIUS,LAT,LNG);
);
out 40;
`;

function poiMeta(tags: any): { kind: string; emoji: string } | null {
  if (tags.highway === "bus_stop") return { kind: "Bus stop", emoji: "🚌" };
  if (tags.railway === "station") return { kind: "Railway", emoji: "🚆" };
  if (tags.amenity === "restaurant") return { kind: "Restaurant", emoji: "🍴" };
  if (tags.amenity === "hospital") return { kind: "Hospital", emoji: "🏥" };
  if (tags.amenity === "pharmacy") return { kind: "Pharmacy", emoji: "💊" };
  if (tags.amenity === "atm") return { kind: "ATM", emoji: "🏧" };
  if (tags.shop) return { kind: "Grocery", emoji: "🛒" };
  return null;
}

const RouteNavigator = ({ open, onClose, destination, hostelName }: Props) => {
  const [userLoc, setUserLoc] = useState<LatLng | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [mode, setMode] = useState<Mode>("car");
  const [route, setRoute] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [showSteps, setShowSteps] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // Live location tracking while the navigator is open
  useEffect(() => {
    if (!open) return;
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    setLocError(null);

    const onPos = (pos: GeolocationPosition) => {
      setUserLoc((prev) => {
        const next: LatLng = [pos.coords.latitude, pos.coords.longitude];
        // Ignore jitter under ~15 m so the route isn't refetched constantly
        if (prev && haversineKm(prev, next) < 0.015) return prev;
        return next;
      });
      setLocating(false);
      setLocError(null);
    };
    const onErr = (err: GeolocationPositionError) => {
      setLocating(false);
      setLocError(
        err.code === err.PERMISSION_DENIED
          ? "Location permission denied. Please enable it to see the route."
          : "Unable to retrieve your location."
      );
    };
    const opts: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 };

    navigator.geolocation.getCurrentPosition(onPos, onErr, opts);
    const watchId = navigator.geolocation.watchPosition(onPos, onErr, opts);
    return () => navigator.geolocation.clearWatch(watchId);
  }, [open]);

  // Fetch OSRM route when user location, destination, or mode changes
  useEffect(() => {
    if (!open || !userLoc) return;
    const m = MODES.find((x) => x.id === mode)!;
    const host = OSRM_HOSTS[m.profile];
    const profilePath = OSRM_PROFILE_PATH[m.profile];
    const url = `${host}/route/v1/${profilePath}/${userLoc[1]},${userLoc[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`;
    setRouteLoading(true);
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.routes?.[0]) throw new Error("No route");
        const r = data.routes[0];
        const coords: LatLng[] = r.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        const baseMin = r.duration / 60;
        const durationMin = mode === "transit" ? Math.round(baseMin * 1.4) : Math.round(baseMin);
        const steps = (r.legs?.[0]?.steps ?? []).map((s: any) => ({
          text: humanStep(s),
          distance: s.distance,
        }));
        setRoute({ geometry: coords, distanceKm: r.distance / 1000, durationMin, steps });
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback: straight line
        const km = haversineKm(userLoc, destination);
        setRoute({
          geometry: [userLoc, destination],
          distanceKm: km,
          durationMin: estimateMinutes(km, mode),
          steps: [
            { text: "Head toward your destination", distance: km * 1000 },
            { text: `You will arrive at ${hostelName}`, distance: 0 },
          ],
        });
      })
      .finally(() => !cancelled && setRouteLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, userLoc, destination, mode, hostelName]);

  // Fetch nearby POIs around destination once
  useEffect(() => {
    if (!open) return;
    const radius = 800;
    const body = POI_QUERY
      .replace(/RADIUS/g, String(radius))
      .replace(/LAT/g, String(destination[0]))
      .replace(/LNG/g, String(destination[1]));
    let cancelled = false;
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: POI[] = [];
        for (const el of data.elements ?? []) {
          const meta = poiMeta(el.tags ?? {});
          if (!meta) continue;
          list.push({
            id: String(el.id),
            lat: el.lat,
            lng: el.lon,
            name: el.tags?.name || meta.kind,
            kind: meta.kind,
            emoji: meta.emoji,
          });
          if (list.length >= 30) break;
        }
        setPois(list);
      })
      .catch(() => setPois([]));
    return () => { cancelled = true; };
  }, [open, destination]);

  const allPoints = useMemo<LatLng[]>(
    () => (route ? route.geometry : userLoc ? [userLoc, destination] : [destination]),
    [route, userLoc, destination]
  );

  const fmtDur = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`);

  const retryLocate = () => {
    setLocError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLoc([pos.coords.latitude, pos.coords.longitude]); setLocating(false); },
      (err) => {
        setLocating(false);
        setLocError(err.code === err.PERMISSION_DENIED ? "Location permission denied." : "Unable to get location.");
        toast.error("Could not access your location");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  if (!open) return null;

  const content = (
    <div
      className="fixed inset-0 z-[2000] flex flex-col bg-background"
      data-testid="route-navigator"
      data-destination={`${destination[0]},${destination[1]}`}
      data-mode={mode}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Route to</p>
          <h2 className="truncate text-base font-semibold text-foreground md:text-lg">{hostelName}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-border bg-background p-2 transition-colors hover:bg-secondary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="relative flex-1">
          <MapContainer
            center={destination}
            zoom={14}
            className="h-full w-full"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={allPoints} />

            <Marker position={destination} icon={hostelIcon}>
              <Popup>{hostelName}</Popup>
            </Marker>

            {userLoc && (
              <Marker position={userLoc} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {route && (
              <Polyline
                positions={route.geometry}
                pathOptions={{ color: "hsl(221,83%,53%)", weight: 5, opacity: 0.85 }}
              />
            )}

            {pois.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={poiIcon(p.emoji)}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-muted-foreground">{p.kind}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Loading overlays */}
          {(locating || (!userLoc && !locError)) && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-5 shadow-xl">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Getting your location…</p>
                <p className="text-xs text-muted-foreground">Allow location access when prompted</p>
              </div>
            </div>
          )}

          {locError && !userLoc && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
              <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
                <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                <p className="mt-3 text-sm font-medium text-foreground">{locError}</p>
                <button
                  onClick={retryLocate}
                  className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <AnimatePresence>
          <motion.aside
            key="panel"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="absolute bottom-0 left-0 right-0 z-[1100] max-h-[55vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card/95 p-4 shadow-2xl backdrop-blur md:static md:max-h-none md:w-96 md:rounded-none md:border-l md:border-t-0"
          >
            {/* Mode tabs */}
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-secondary p-1">
              {MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  data-testid={`mode-${id}`}
                  onClick={() => setMode(id)}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-all ${
                    mode === id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background p-3">
                <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <RouteIcon className="h-3 w-3" /> Distance
                </p>
                <p data-testid="route-distance" className="mt-1 text-xl font-bold tabular-nums text-foreground">
                  {routeLoading || !route ? "—" : formatDistance(route.distanceKm)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-3">
                <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3 w-3" /> Time
                </p>
                <p data-testid="route-duration" className="mt-1 text-xl font-bold tabular-nums text-foreground">
                  {routeLoading || !route ? "—" : fmtDur(route.durationMin)}
                </p>
              </div>
            </div>

            {mode === "transit" && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Transit time is an estimate based on driving route × 1.4.
              </p>
            )}

            {/* Steps */}
            <div className="mt-5">
              <button
                onClick={() => setShowSteps((s) => !s)}
                className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" /> Step-by-step
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${showSteps ? "rotate-90" : ""}`} />
              </button>

              {showSteps && (
                <ol className="mt-3 space-y-2">
                  {(route?.steps ?? []).map((s, i) => (
                    <li key={i} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{s.text}</p>
                        {s.distance > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDistance(s.distance / 1000)}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                  {!route && !routeLoading && (
                    <li className="text-sm text-muted-foreground">No directions available.</li>
                  )}
                  {routeLoading && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Computing route…
                    </li>
                  )}
                </ol>
              )}
            </div>

            {/* Nearby */}
            {pois.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> Nearby ({pois.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {pois.slice(0, 18).map((p) => (
                    <span
                      key={p.id}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                    >
                      <span>{p.emoji}</span>
                      <span className="max-w-[120px] truncate">{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </AnimatePresence>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

function humanStep(s: any): string {
  const m = s.maneuver ?? {};
  const road = s.name || "the road";
  const type = m.type as string | undefined;
  const mod = m.modifier as string | undefined;
  switch (type) {
    case "depart": return `Start from your current location${s.name ? " on " + road : ""}`;
    case "arrive": return `Arrive at your destination`;
    case "turn": return `Turn ${mod || ""} onto ${road}`.trim();
    case "new name": return `Continue on ${road}`;
    case "merge": return `Merge ${mod || ""} onto ${road}`.trim();
    case "on ramp": return `Take the ramp onto ${road}`;
    case "off ramp": return `Take the exit onto ${road}`;
    case "fork": return `Keep ${mod || "straight"} at the fork onto ${road}`;
    case "roundabout":
    case "rotary": return `Enter the roundabout and take exit onto ${road}`;
    case "continue": return `Continue ${mod || "straight"} on ${road}`;
    case "end of road": return `Turn ${mod || ""} onto ${road}`.trim();
    default: return `Continue on ${road}`;
  }
}

export default RouteNavigator;
