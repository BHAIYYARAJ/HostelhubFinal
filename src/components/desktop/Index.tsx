import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHostels } from "@/hooks/useHostels";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Filters from "@/components/Filters";
import HostelCard from "@/components/HostelCard";
import Footer from "@/components/Footer";
import { Loader2, Navigation, Sparkles, X } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { getHostelCoords, haversineKm, estimateMinutes, formatDistance } from "@/lib/hostelCoords";
import { toast } from "sonner";
import { requestUserLocation, type LocationFailure } from "@/lib/userLocation";

const Index = () => {
  const { searchQuery, selectedCity, priceRange, selectedType, userLocation, setUserLocation } = useAppStore();
  const { data: hostels = [], isLoading } = useHostels();
  const [locating, setLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(0); // 0 = no radius limit

  const locateUser = async () => {
    setLocating(true);
    try {
      const { coords, accuracyMeters } = await requestUserLocation();
      setUserLocation(coords);
      toast.success(
        `Location updated (±${Math.round(accuracyMeters)} m) — hostels sorted by distance`
      );
    } catch (e) {
      const err = e as LocationFailure;
      toast.error(err.message);
    } finally {
      setLocating(false);
    }
  };

  const filtered = useMemo(() => {
    const list = hostels.filter((h) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q);
      const matchCity = selectedCity === "All Cities" || h.city === selectedCity;
      const matchPrice = h.price <= priceRange[1];
      const matchType = selectedType === "all" || h.type === selectedType;
      return matchSearch && matchCity && matchPrice && matchType;
    });
    if (!userLocation) return list.map((h) => ({ h, distanceKm: undefined as number | undefined }));
    return list
      .map((h) => {
        const coords = getHostelCoords(h);
        return { h, distanceKm: coords ? haversineKm(userLocation, coords) : undefined };
      })
      .filter(({ distanceKm }) =>
        radiusKm > 0 ? typeof distanceKm === "number" && distanceKm <= radiusKm : true
      )
      .sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
  }, [searchQuery, selectedCity, priceRange, selectedType, hostels, userLocation, radiusKm]);

  const recommendation = useMemo(() => {
    if (!userLocation || filtered.length === 0) return null;
    const top = filtered[0];
    if (typeof top.distanceKm !== "number") return null;
    const score = Math.max(40, Math.min(99, Math.round(100 - top.distanceKm * 6 + (top.h.rating - 3) * 4)));
    return { ...top, score };
  }, [filtered, userLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      <section className="container py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {userLocation ? "Sorted by distance from you" : "Find hostels near you"}
              </p>
              <p className="text-xs text-muted-foreground">
                {userLocation
                  ? "Distances and travel times shown on each card"
                  : "Share your location to see distance & travel time for every hostel"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userLocation && (
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                aria-label="Search radius"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value={0}>Any distance</option>
                <option value={1}>Within 1 km</option>
                <option value={3}>Within 3 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
              </select>
            )}
            {userLocation && (
              <button
                onClick={() => { setUserLocation(null); setRadiusKm(0); }}
                className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                aria-label="Clear location"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={locateUser}
              disabled={locating}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {userLocation ? "Update location" : "Use my location"}
            </button>
          </div>
        </div>

        {recommendation && (
          <Link
            to={`/hostel/${recommendation.h.id}`}
            className="mb-8 flex items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 transition-shadow hover:shadow-card-hover"
          >
            <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
              <img src={recommendation.h.images[0]} alt={recommendation.h.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Recommended for you
              </p>
              <p className="mt-1 truncate text-base font-semibold text-foreground">{recommendation.h.name}</p>
              <p className="text-xs text-muted-foreground">
                Only {formatDistance(recommendation.distanceKm!)} away · ~{estimateMinutes(recommendation.distanceKm!, "car")} min by car · ₹{recommendation.h.price.toLocaleString()}/mo
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-2xl font-bold tabular-nums text-primary">{recommendation.score}%</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Convenience</p>
            </div>
          </Link>
        )}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Explore hostels
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filtered.length} accommodation${filtered.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <Filters />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading hostels...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(({ h, distanceKm }, i) => (
              <HostelCard
                key={h.id}
                hostel={h}
                index={i}
                distanceKm={distanceKm}
                travelMin={typeof distanceKm === "number" ? estimateMinutes(distanceKm, "car") : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-secondary p-6">
              <span className="text-3xl">🏠</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">No hostels found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Index;
