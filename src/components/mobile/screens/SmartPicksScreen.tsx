import { useEffect, useState } from "react";
import {
  ChevronRight,
  GitCompareArrows,
  Heart,
  Loader2,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { AppHeader, HeaderIconButton } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppSheet } from "@/components/mobile/AppSheet";
import { AppButton, AppCard, EmptyState } from "@/components/mobile/MobileKit";
import ExplanationPanel from "@/features/recommendations/components/ExplanationPanel";
import RecommendationMapClient from "@/features/recommendations/components/RecommendationMapClient";
import { useRecommendations } from "@/features/recommendations/hooks/useRecommendations";
import { feedbackRepo } from "@/features/recommendations/repositories/feedbackRepo";
import { MAX_COMPARE, useComparisonStore } from "@/features/recommendations/store/useComparisonStore";
import type { ScoredHostel } from "@/features/recommendations/types";
import { Link, useNavigate } from "@/lib/router-compat";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

export function SmartPicksScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    recommendations,
    radiusExpanded,
    appliedRadiusKm,
    preference,
    isLoading,
    recordHistory,
  } = useRecommendations();

  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const compareIds = useComparisonStore((s) => s.ids);
  const toggleCompare = useComparisonStore((s) => s.toggle);

  const [why, setWhy] = useState<ScoredHostel | null>(null);

  useEffect(() => {
    if (recommendations.length > 0) recordHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations.length]);

  const origin: [number, number] | null =
    preference?.preferred_lat != null && preference?.preferred_lng != null
      ? [preference.preferred_lat, preference.preferred_lng]
      : null;

  const onCompare = (id: string) => {
    if (!compareIds.includes(id) && compareIds.length >= MAX_COMPARE) {
      toast.error(`Compare up to ${MAX_COMPARE} hostels`);
      return;
    }
    toggleCompare(id);
    if (user && !compareIds.includes(id)) feedbackRepo.record(user.id, id, "compared");
  };

  const onSave = (id: string) => {
    toggleFavorite(id);
    if (user) feedbackRepo.record(user.id, id, "saved");
  };

  return (
    <AppScreen className={compareIds.length ? "pb-40" : undefined}>
      <AppHeader
        title="Smart Picks"
        subtitle="Ranked for your preferences"
        actions={
          <HeaderIconButton label="Preferences" onClick={() => navigate("/preferences")}>
            <SlidersHorizontal className="h-[21px] w-[21px]" />
          </HeaderIconButton>
        }
      />

      {!user ? (
        <EmptyState
          icon={Sparkles}
          title="Sign in for Smart Picks"
          body="We rank hostels using your budget, safety and travel preferences."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !preference ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="Set your preferences"
          body="Tell us your budget, city and must-haves and we'll do the ranking."
          action={<AppButton to="/preferences">Set preferences</AppButton>}
        />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches yet"
          body="Try relaxing your budget or radius in preferences."
          action={<AppButton to="/preferences">Edit preferences</AppButton>}
        />
      ) : (
        <>
          <ScreenSection>
            <div className="overflow-hidden rounded-3xl shadow-app-card">
              <RecommendationMapClient
                items={recommendations.slice(0, 20)}
                origin={origin}
                originLabel={preference?.preferred_location}
                radiusKm={appliedRadiusKm}
              />
            </div>
            {appliedRadiusKm != null && (
              <p className="mt-2 px-1 text-[12px] text-muted-foreground">
                Showing stays within {appliedRadiusKm} km of{" "}
                {preference?.preferred_location || "your pinned location"} — the circle on the map
                matches this radius.
              </p>
            )}
          </ScreenSection>

          <ScreenSection className="pb-6">
            {radiusExpanded && (
              <div className="mb-4 rounded-2xl bg-coral-light px-4 py-3">
                <p className="text-[12px] font-semibold text-primary">
                  We widened the search radius to find you more matches.
                </p>
              </div>
            )}
            <div className="space-y-4">
              {recommendations.map((item, index) => {
                const h = item.hostel;
                const score = Math.round(item.overall);
                const inCompare = compareIds.includes(h.id);
                const saved = favorites.includes(h.id);
                const reasons = item.explanation?.reasons ?? [];
                return (
                  <AppCard key={h.id} padded={false}>
                    <Link to={`/hostel/${h.id}`} className="tap block">
                      <div className="flex gap-3 p-3">
                        <div className="relative shrink-0">
                          <img
                            src={h.images?.[0]}
                            alt={h.name}
                            loading="lazy"
                            className="h-24 w-24 rounded-2xl object-cover"
                          />
                          <span className="absolute -left-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                            <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                              {h.name}
                            </p>
                            {!!score && (
                              <span className="shrink-0 rounded-full bg-coral-light px-2 py-0.5 text-[10px] font-bold text-primary">
                                {score}% match
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {h.location}, {h.city}
                          </p>
                          {item.distanceKm != null && (
                            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                              {item.distanceKm < 1
                                ? `${Math.round(item.distanceKm * 1000)} m`
                                : `${item.distanceKm.toFixed(1)} km`}{" "}
                              away
                              {item.eta
                                ? ` · ${item.eta.walk}m walk · ${item.eta.bike}m bike · ${item.eta.car}m drive`
                                : ""}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-[15px] font-extrabold tracking-tight text-foreground">
                              ₹{Number(h.price).toLocaleString("en-IN")}
                            </span>
                            <span className="flex items-center gap-1 text-[12px] font-bold text-foreground">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {Number(h.rating ?? 0).toFixed(1)}
                            </span>
                            {item.safety?.score != null && (
                              <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {Math.round(item.safety.score)}
                              </span>
                            )}
                            {item.trust?.score != null && (
                              <span className="text-[12px] font-bold text-primary">
                                Trust {Math.round(item.trust.score)}
                              </span>
                            )}
                          </div>
                          {!!reasons.length && (
                            <p className="mt-1.5 truncate text-[11px] font-medium text-primary">
                              {reasons.slice(0, 2).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="grid grid-cols-3 divide-x divide-app-hairline border-t border-app-hairline">
                      <button
                        type="button"
                        onClick={() => onSave(h.id)}
                        className="tap flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-foreground"
                      >
                        <Heart
                          className={cn("h-4 w-4", saved && "fill-primary text-primary")}
                        />
                        {saved ? "Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCompare(h.id)}
                        className={cn(
                          "tap flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold",
                          inCompare ? "text-primary" : "text-foreground",
                        )}
                      >
                        <GitCompareArrows className="h-4 w-4" />
                        {inCompare ? "In compare" : "Compare"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWhy(item)}
                        className="tap flex items-center justify-center gap-1 py-3 text-[12px] font-bold text-foreground"
                      >
                        Why
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </AppCard>
                );
              })}
            </div>
          </ScreenSection>
        </>
      )}

      {compareIds.length > 0 && (
        <div className="fixed inset-x-4 bottom-[calc(var(--tabbar-height)+var(--safe-bottom)+0.75rem)] z-40">
          <Link
            to="/compare"
            className="tap flex h-14 items-center justify-between rounded-2xl bg-foreground px-5 text-background shadow-app-float"
          >
            <span className="text-[14px] font-bold tracking-tight">
              Compare {compareIds.length} {compareIds.length === 1 ? "stay" : "stays"}
            </span>
            <GitCompareArrows className="h-5 w-5" />
          </Link>
        </div>
      )}

      <AppSheet
        open={!!why}
        onOpenChange={(o) => !o && setWhy(null)}
        title="Why we recommend this"
        description={why?.hostel.name}
      >
        {why && (
          <div className="pb-4">
            <ExplanationPanel explanation={why.explanation} sub={why.subScores} />
            <div className="mt-4">
              <AppButton to={`/hostel/${why.hostel.id}`}>View hostel</AppButton>
            </div>
          </div>
        )}
      </AppSheet>
    </AppScreen>
  );
}
