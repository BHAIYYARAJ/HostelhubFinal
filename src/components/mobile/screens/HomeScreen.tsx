import { useMemo, useState } from "react";
import { Bell, Heart, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { AppHeader, HeaderIconButton } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppSheet } from "@/components/mobile/AppSheet";
import { HostelCardMobile } from "@/components/mobile/HostelCardMobile";
import {
  AppButton,
  Chip,
  ChipRow,
  EmptyState,
  Segmented,
  SkeletonCards,
} from "@/components/mobile/MobileKit";
import { useHostels } from "@/hooks/useHostels";
import { cities, facilityOptions } from "@/lib/constants";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

export function HomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: hostels, isLoading } = useHostels();

  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectedCity = useAppStore((s) => s.selectedCity);
  const setSelectedCity = useAppStore((s) => s.setSelectedCity);
  const selectedType = useAppStore((s) => s.selectedType);
  const setSelectedType = useAppStore((s) => s.setSelectedType);
  const priceRange = useAppStore((s) => s.priceRange);
  const setPriceRange = useAppStore((s) => s.setPriceRange);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [facilities, setFacilities] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const list = hostels ?? [];
    const q = searchQuery.trim().toLowerCase();
    return list.filter((h) => {
      if (q && !`${h.name} ${h.city} ${h.location}`.toLowerCase().includes(q)) return false;
      if (selectedCity !== "All Cities" && h.city !== selectedCity) return false;
      if (selectedType !== "all" && h.type !== selectedType) return false;
      if (h.price < priceRange[0] || h.price > priceRange[1]) return false;
      if (facilities.length && !facilities.every((f) => (h.facilities ?? []).includes(f))) return false;
      return true;
    });
  }, [hostels, searchQuery, selectedCity, selectedType, priceRange, facilities]);

  const featured = useMemo(() => (hostels ?? []).filter((h) => h.is_featured).slice(0, 6), [hostels]);
  const activeFilters =
    (selectedType !== "all" ? 1 : 0) + (facilities.length ? 1 : 0) + (priceRange[1] < 15000 ? 1 : 0);

  return (
    <AppScreen>
      <header className="glass-bar sticky top-0 z-40 border-b border-app-hairline pt-safe">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {user ? `Hi, ${user.name?.split(" ")[0] || "there"}` : "Welcome to"}
            </p>
            <h1 className="truncate text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
              Find your stay
            </h1>
          </div>
          <div className="flex shrink-0 items-center">
            <HeaderIconButton label="Saved" onClick={() => navigate("/favorites")}>
              <Heart className="h-[22px] w-[22px]" />
            </HeaderIconButton>
            <HeaderIconButton label="Notifications" onClick={() => navigate("/notifications")}>
              <Bell className="h-[22px] w-[22px]" />
            </HeaderIconButton>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-4 pb-3">
          <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-muted px-4 py-3">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hostels, areas, cities"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setFiltersOpen(true)}
            className="tap relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-foreground text-background"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        <div className="px-4 pb-3">
          <ChipRow>
            {cities.map((c) => (
              <Chip key={c} active={selectedCity === c} onClick={() => setSelectedCity(c)}>
                {c}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </header>

      <Link
        to="/recommendations"
        className="tap mx-4 mt-4 flex items-center gap-3 rounded-3xl bg-primary p-4 shadow-app-float"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold tracking-tight text-primary-foreground">
            Smart Picks for you
          </span>
          <span className="block truncate text-[12px] text-primary-foreground/80">
            Personalised, safety-scored matches
          </span>
        </span>
      </Link>

      {featured.length > 0 && (
        <ScreenSection
          title="Featured"
          action={
            <Link to="/map" className="text-[13px] font-bold text-primary">
              Map view
            </Link>
          }
        >
          <div className="app-scroll -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {featured.map((h) => (
              <Link
                key={h.id}
                to={`/hostel/${h.id}`}
                className="tap w-64 shrink-0 snap-start overflow-hidden rounded-3xl bg-app-surface shadow-app-card"
              >
                <img
                  src={h.images?.[0]}
                  alt={h.name}
                  loading="lazy"
                  className="h-36 w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate text-[14px] font-bold tracking-tight text-foreground">{h.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {h.city}
                  </p>
                  <p className="mt-2 text-[15px] font-extrabold tracking-tight text-foreground">
                    ₹{Number(h.price).toLocaleString("en-IN")}
                    <span className="text-[11px] font-semibold text-muted-foreground"> /mo</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScreenSection>
      )}

      <ScreenSection
        title={filtered.length ? `${filtered.length} stays available` : "Stays"}
        className="pb-6"
      >
        {isLoading ? (
          <SkeletonCards />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No stays match"
            body="Try widening your filters or picking another city."
            action={
              <AppButton
                variant="secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("All Cities");
                  setSelectedType("all");
                  setPriceRange([0, 15000]);
                  setFacilities([]);
                }}
              >
                Reset filters
              </AppButton>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((h) => (
              <HostelCardMobile key={h.id} hostel={h} />
            ))}
          </div>
        )}
      </ScreenSection>

      <AppSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filters"
        description="Narrow down to the perfect stay"
        footer={
          <div className="flex gap-3">
            <AppButton
              variant="secondary"
              onClick={() => {
                setSelectedType("all");
                setPriceRange([0, 15000]);
                setFacilities([]);
              }}
            >
              Reset
            </AppButton>
            <AppButton onClick={() => setFiltersOpen(false)}>Show {filtered.length} stays</AppButton>
          </div>
        }
      >
        <div className="space-y-6 pb-2">
          <div>
            <p className="mb-2 text-[13px] font-bold tracking-tight text-foreground">Hostel type</p>
            <Segmented
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: "all", label: "All" },
                { value: "boys", label: "Boys" },
                { value: "girls", label: "Girls" },
                { value: "co-ed", label: "Co-ed" },
              ]}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-bold tracking-tight text-foreground">Max monthly rent</p>
              <p className="text-[13px] font-extrabold text-primary">
                ₹{priceRange[1].toLocaleString("en-IN")}
              </p>
            </div>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="h-2 w-full accent-primary"
            />
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold tracking-tight text-foreground">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {facilityOptions.map((f) => (
                <Chip
                  key={f}
                  active={facilities.includes(f)}
                  onClick={() =>
                    setFacilities((prev) =>
                      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
                    )
                  }
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </AppSheet>
    </AppScreen>
  );
}
