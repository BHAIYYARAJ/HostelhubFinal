import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/lib/router-compat";
import type { ScoredHostel } from "../types";

const hostelIcon = new L.DivIcon({
  className: "rec-marker",
  html: `<div style="background:hsl(var(--primary));color:hsl(var(--primary-foreground));border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏠</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const originIcon = new L.DivIcon({
  className: "origin-marker",
  html: `<div style="background:#111;color:#fff;border-radius:50%;width:18px;height:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, JSON.stringify(points)]);
  return null;
}

export default function RecommendationMap({
  items,
  origin,
  originLabel,
  radiusKm,
}: {
  items: ScoredHostel[];
  origin: [number, number] | null;
  originLabel?: string | null;
  radiusKm?: number | null;
}) {
  const markers = useMemo(
    () =>
      items
        .filter((i) => i.hostel.latitude != null && i.hostel.longitude != null)
        .map((i) => ({ item: i, pos: [i.hostel.latitude as number, i.hostel.longitude as number] as [number, number] })),
    [items]
  );

  const points: [number, number][] = [
    ...(origin ? [origin] : []),
    ...markers.map((m) => m.pos),
  ];
  const center = origin ?? markers[0]?.pos ?? [20.5937, 78.9629];

  return (
    <div
      data-testid="recommendation-map"
      data-marker-count={markers.length}
      className="h-[360px] w-full overflow-hidden rounded-2xl border border-border"
    >
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <FitBounds points={points} />
        {origin && (
          <>
            <Marker position={origin} icon={originIcon}>
              <Popup>{originLabel || "Your preferred location"}</Popup>
            </Marker>
            {radiusKm ? (
              <Circle center={origin} radius={radiusKm * 1000} pathOptions={{ color: "hsl(var(--primary))", fillOpacity: 0.05 }} />
            ) : null}
          </>
        )}
        {markers.map(({ item, pos }) => (
          <Marker key={item.hostel.id} position={pos} icon={hostelIcon}>
            <Popup>
              <div className="space-y-1">
                <Link to={`/hostel/${item.hostel.id}`} className="font-semibold">
                  {item.hostel.name}
                </Link>
                <div className="text-xs">{item.overall}% match · ₹{item.hostel.price.toLocaleString()}/mo</div>
                {item.distanceKm != null && (
                  <div className="text-xs">{item.distanceKm.toFixed(1)} km away</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}