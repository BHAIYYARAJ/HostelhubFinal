import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { DbHostel } from "@/hooks/useHostels";
import { cityCoords } from "@/lib/hostelCoords";

const hostelIcon = new L.DivIcon({
  className: "hostel-marker-mobile",
  html: `<div style="background:hsl(0,72%,55%);color:#fff;border-radius:18px 18px 18px 6px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:15px;border:2.5px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,0.28);">🏠</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const userIcon = new L.DivIcon({
  className: "user-marker-mobile",
  html: `<div style="background:#2563eb;border-radius:50%;width:18px;height:18px;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,0.18);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FlyTo({ city, userLocation }: { city: string; userLocation: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 1 });
      return;
    }
    const coords = cityCoords[city];
    if (coords) map.flyTo(coords, city === "All Cities" ? 4.6 : 12.5, { duration: 1 });
  }, [city, userLocation, map]);
  return null;
}

export default function MobileMap({
  hostels,
  city,
  userLocation,
  onSelect,
}: {
  hostels: DbHostel[];
  city: string;
  userLocation: [number, number] | null;
  onSelect: (id: string) => void;
}) {
  const center = cityCoords[city] ?? ([20.5937, 78.9629] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={city === "All Cities" ? 4.6 : 12.5}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <FlyTo city={city} userLocation={userLocation} />
      {userLocation && <Marker position={userLocation} icon={userIcon} />}
      {hostels
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude as number, h.longitude as number]}
            icon={hostelIcon}
            eventHandlers={{ click: () => onSelect(h.id) }}
          />
        ))}
    </MapContainer>
  );
}
