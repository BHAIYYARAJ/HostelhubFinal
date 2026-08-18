import { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/lib/router-compat";
import { useHostels } from "@/hooks/useHostels";
import { useAppStore } from "@/store/useAppStore";
import Navbar from "@/components/Navbar";
import { Search, MapPin, Navigation, Star, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { requestUserLocation, type LocationFailure } from "@/lib/userLocation";

// Fix default marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom hostel marker
const hostelIcon = new L.DivIcon({
  className: "hostel-marker",
  html: `<div style="background:hsl(221.2,83.2%,53.3%);color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const userIcon = new L.DivIcon({
  className: "user-marker",
  html: `<div style="background:hsl(0,84.2%,60.2%);color:white;border-radius:50%;width:20px;height:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

import { cityCoords } from "@/lib/hostelCoords";

// Return real DB coordinates if present, otherwise null (hostel is skipped on map).
function getMarkerCoords(h: { latitude?: number | null; longitude?: number | null }): [number, number] | null {
  if (h.latitude != null && h.longitude != null && !isNaN(h.latitude) && !isNaN(h.longitude)) {
    return [h.latitude, h.longitude];
  }
  return null;
}

// Component to fly map to selected city
function FlyToCity({ city }: { city: string }) {
  const map = useMap();
  useEffect(() => {
    const coords = cityCoords[city];
    if (coords) {
      map.flyTo(coords, city === "All Cities" ? 5 : 13, { duration: 1.2 });
    }
  }, [city, map]);
  return null;
}

// Type filter options
const typeOptions = [
  { value: "all", label: "All" },
  { value: "boys", label: "Boys" },
  { value: "girls", label: "Girls" },
  { value: "co-ed", label: "Co-ed" },
];

const MapExplore = () => {
  const { data: hostels = [], isLoading } = useHostels();
  const { selectedCity, setSelectedCity, selectedType, setSelectedType, priceRange, setPriceRange, searchQuery, setSearchQuery } = useAppStore();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const mapRef = useRef<L.Map | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery]);

  // Filter hostels — only those with real coordinates are placed on the map.
  const filtered = useMemo(() => {
    return hostels.filter((h) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
      const matchCity = selectedCity === "All Cities" || h.city === selectedCity;
      const matchPrice = h.price <= priceRange[1];
      const matchType = selectedType === "all" || h.type === selectedType;
      return matchSearch && matchCity && matchPrice && matchType && getMarkerCoords(h) !== null;
    });
  }, [searchQuery, selectedCity, priceRange, selectedType, hostels]);

  // Get user location
  const locateUser = async () => {
    setLocatingUser(true);
    try {
      const { coords } = await requestUserLocation();
      setUserLocation(coords);
      mapRef.current?.flyTo(coords, 14, { duration: 1.2 });
    } catch (e) {
      toast.error((e as LocationFailure).message);
    } finally {
      setLocatingUser(false);
    }
  };

  const cities = Object.keys(cityCoords);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar filters */}
        <aside className="hidden w-80 flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-card p-4 md:flex">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hostels..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {localSearch && (
              <button onClick={() => setLocalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* City */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedType(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedType === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-foreground/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Max Budget: <span className="font-semibold text-foreground">₹{priceRange[1].toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={3000}
              max={15000}
              step={500}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>₹3,000</span>
              <span>₹15,000</span>
            </div>
          </div>

          {/* Locate me */}
          <button
            onClick={locateUser}
            disabled={locatingUser}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {locatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {locatingUser ? "Locating..." : "My Location"}
          </button>

          {/* Results count */}
          <div className="rounded-xl bg-secondary/50 px-3 py-2 text-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> hostel{filtered.length !== 1 ? "s" : ""} found
          </div>

          {/* Hostel list */}
          <div className="flex flex-col gap-2">
            {filtered.map((h) => {
              const coords = getMarkerCoords(h)!;
              return (
                <button
                  key={h.id}
                  onClick={() => mapRef.current?.flyTo(coords, 16, { duration: 0.8 })}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-secondary"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {h.images?.[0] ? (
                      <img src={h.images[0]} alt={h.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">🏠</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{h.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.location}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">₹{h.price.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {h.rating}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Map */}
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Mobile filters bar */}
          <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center gap-2 bg-background/90 p-2 backdrop-blur-sm md:hidden">
            <input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button onClick={locateUser} className="rounded-lg border border-border bg-background p-2">
              <Navigation className="h-4 w-4" />
            </button>
          </div>

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToCity city={selectedCity} />

            {/* Hostel markers — sourced directly from the database */}
            {filtered.map((h) => {
              const coords = getMarkerCoords(h)!;
              const distance = h.distance_from_college || "N/A";
              return (
                <Marker key={h.id} position={coords} icon={hostelIcon}>
                  <Popup>
                    <div className="min-w-[220px]">
                      {h.images?.[0] && (
                        <img
                          src={h.images[0]}
                          alt={h.name}
                          className="mb-2 h-24 w-full rounded-lg object-cover"
                        />
                      )}
                      <h3 className="text-sm font-bold">{h.name}</h3>
                      <p className="text-xs text-gray-600">Owner: {h.owner_name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {h.address || `${h.location}, ${h.city}`}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600">₹{h.price.toLocaleString()}/mo</span>
                        <span className="flex items-center gap-0.5 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {h.rating}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        🛏 Available rooms: {h.available_rooms ?? "—"}
                        {h.total_rooms != null ? ` / ${h.total_rooms}` : ""}
                      </p>
                      <p className="text-xs text-gray-500">📍 {distance} from college</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {h.facilities?.slice(0, 4).map((f) => (
                          <span key={f} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">{f}</span>
                        ))}
                      </div>
                      <Link
                        to={`/hostel/${h.id}`}
                        className="mt-2 block rounded-lg bg-blue-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* User location */}
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="text-sm font-semibold">📍 You are here</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapExplore;
