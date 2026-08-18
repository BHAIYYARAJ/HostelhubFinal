import { useEffect } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { Loader2, Sparkles, Settings2, GitCompareArrows } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useRecommendations } from "@/features/recommendations/hooks/useRecommendations";
import RecommendationCard from "@/features/recommendations/components/RecommendationCard";
import { useComparisonStore } from "@/features/recommendations/store/useComparisonStore";
import RecommendationMap from "@/features/recommendations/components/RecommendationMap";

export default function SmartRecommendations() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const {
    recommendations,
    isLoading,
    recordHistory,
    preference,
    appliedRadiusKm,
    radiusExpanded,
  } = useRecommendations();
  const compareCount = useComparisonStore((s) => s.ids.length);
  const origin: [number, number] | null =
    preference?.preferred_lat != null && preference?.preferred_lng != null
      ? [preference.preferred_lat, preference.preferred_lng]
      : null;

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (recommendations.length > 0) recordHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations.length]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Smart Recommendations
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {preference?.preferred_location
                ? `Hostels near ${preference.preferred_location}${appliedRadiusKm ? ` within ${appliedRadiusKm} km` : ""} — ranked by your preferences, safety, trust and availability.`
                : "Personalized by APHR — ranked with your preferences, safety, trust and match quality."}
            </p>
            {appliedRadiusKm != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Showing hostels within exactly {appliedRadiusKm} km of your pinned location — the
                map circle matches this radius.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/preferences"><Settings2 className="mr-1 h-4 w-4" /> Edit preferences</Link>
            </Button>
            <Button asChild>
              <Link to="/compare">
                <GitCompareArrows className="mr-1 h-4 w-4" /> Compare ({compareCount})
              </Link>
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No matches yet. Try updating your preferences to broaden the search.
            </p>
            <Button asChild className="mt-4">
              <Link to="/preferences">Set preferences</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <RecommendationMap
              items={recommendations.slice(0, 20)}
              origin={origin}
              originLabel={preference?.preferred_location}
              radiusKm={appliedRadiusKm}
            />
            {recommendations.slice(0, 20).map((item, i) => (
              <RecommendationCard key={item.hostel.id} item={item} rank={i + 1} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}