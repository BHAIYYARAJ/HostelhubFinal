import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Layers, List, Loader2, MapPin, Navigation, Star } from "lucide-react";
import { toast } from "sonner";

import { AppScreen } from "@/components/mobile/AppScreen";
import { AppSheet } from "@/components/mobile/AppSheet";
import { HostelCardMobile } from "@/components/mobile/HostelCardMobile";
import { Chip, ChipRow, EmptyState } from "@/components/mobile/MobileKit";
import { useHostels } from "@/hooks/useHostels";
import { cities } from "@/lib/constants";
import { Link } from "@/lib/router-compat";
import { requestUserLocation } from "@/lib/userLocation";
import { useAppStore } from "@/store/useAppStore";

const MobileMap = lazy(() => import("@/components/mobile/MobileMap"));

export function ExploreScreen() {
  const { data: hostels } = useHostels();
  const selectedCity = useAppStore((s) => s.selectedCity);
  const setSelectedCity = useAppStore((s) => s.setSelectedCity);
  const userLocation = useAppStore((s) => s.userLocation);
  const setUserLocation = useAppStore((s) => s.setUserLocation);

  const [listOpen, setListOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      (hostels ?? []).filter(
        (h) => selectedCity === "All Cities" || h.city === selectedCity,
      ),
    [hostels, selectedCity],
  );

  const activeHostel = visible.find((h) => h.id === active) ?? null;

  const locate = async () => {
    setLocating(true);
    try {
      const { coords } = await requestUserLocation();
      setUserLocation(coords);
      toast.success("Centred on your location");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Couldn't get your location");
    } finally {
      setLocating(false);
    }
  };

  return (
    <AppScreen withTabBar={false} canvas={false} className="relative h-[100dvh] overflow-hidden">
      <div className="absolute inset-0">
        <ClientOnly fallback={<div className="h-full bg-muted" />}>
        <Suspense
          fallback={
            <div className="grid h-full place-items-center bg-muted">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          }
        >
          <MobileMap
            hostels={visible}
            city={selectedCity}
            userLocation={userLocation}
            onSelect={setActive}
          />
        </Suspense>
        </ClientOnly>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 pt-safe">
        <div className="pointer-events-auto px-4 py-3">
          <div className="rounded-3xl bg-app-surface/95 p-3 shadow-app-card backdrop-blur-xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                Explore {selectedCity === "All Cities" ? "India" : selectedCity}
              </p>
              <span className="shrink-0 rounded-full bg-coral-light px-2.5 py-1 text-[11px] font-bold text-primary">
                {visible.length} stays
              </span>
            </div>
            <div className="mt-2">
              <ChipRow>
                {cities.map((c) => (
                  <Chip key={c} active={selectedCity === c} onClick={() => setSelectedCity(c)}>
                    {c}
                  </Chip>
                ))}
              </ChipRow>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[calc(var(--tabbar-height)+var(--safe-bottom)+1rem)] right-4 z-20 flex flex-col gap-3">
        <button
          type="button"
          aria-label="Use my location"
          onClick={locate}
          className="tap grid h-12 w-12 place-items-center rounded-full bg-app-surface shadow-app-card"
        >
          {locating ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Navigation className="h-5 w-5 text-primary" />
          )}
        </button>
        <button
          type="button"
          aria-label="Show list"
          onClick={() => setListOpen(true)}
          className="tap grid h-12 w-12 place-items-center rounded-full bg-foreground text-background shadow-app-card"
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {activeHostel && (
        <Link
          to={`/hostel/${activeHostel.id}`}
          className="tap absolute inset-x-4 bottom-[calc(var(--tabbar-height)+var(--safe-bottom)+1rem)] z-10 flex gap-3 rounded-3xl bg-app-surface p-3 shadow-app-sheet"
        >
          <img
            src={activeHostel.images?.[0]}
            alt={activeHostel.name}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
              {activeHostel.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {activeHostel.location}
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-[15px] font-extrabold tracking-tight text-foreground">
                ₹{Number(activeHostel.price).toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1 text-[12px] font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {Number(activeHostel.rating ?? 0).toFixed(1)}
              </span>
            </div>
          </div>
        </Link>
      )}

      <AppSheet open={listOpen} onOpenChange={setListOpen} title={`${visible.length} stays nearby`}>
        {visible.length === 0 ? (
          <EmptyState icon={Layers} title="Nothing mapped here" body="Try another city." />
        ) : (
          <div className="space-y-4 pb-4">
            {visible.map((h) => (
              <HostelCardMobile key={h.id} hostel={h} />
            ))}
          </div>
        )}
      </AppSheet>
    </AppScreen>
  );
}
