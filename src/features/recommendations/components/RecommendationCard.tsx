import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/lib/router-compat";
import { Bookmark, ChevronDown, ChevronUp, GitCompareArrows, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { feedbackRepo } from "../repositories/feedbackRepo";
import { useComparisonStore, MAX_COMPARE } from "../store/useComparisonStore";
import type { ScoredHostel } from "../types";
import SafetyBadge from "./SafetyBadge";
import TrustBadge from "./TrustBadge";
import ConfidenceMeter from "./ConfidenceMeter";
import ExplanationPanel from "./ExplanationPanel";
import BookingDialog from "@/components/BookingDialog";
import { toast } from "sonner";

export default function RecommendationCard({ item, rank }: { item: ScoredHostel; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const toggleFav = useAppStore((s) => s.toggleFavorite);
  const favorites = useAppStore((s) => s.favorites);
  const compareIds = useComparisonStore((s) => s.ids);
  const toggleCompare = useComparisonStore((s) => s.toggle);

  const h = item.hostel;
  const inCompare = compareIds.includes(h.id);
  const isFav = favorites.includes(h.id);
  const cover = h.images?.[0] ?? "/placeholder.svg";

  const onSave = () => {
    toggleFav(h.id);
    if (user) feedbackRepo.record(user.id, h.id, "saved");
    toast.success(isFav ? "Removed from saved" : "Saved to favorites");
  };

  const onCompare = () => {
    if (!inCompare && compareIds.length >= MAX_COMPARE) {
      toast.error(`Compare up to ${MAX_COMPARE} hostels`);
      return;
    }
    toggleCompare(h.id);
    if (user && !inCompare) feedbackRepo.record(user.id, h.id, "compared");
  };

  const onBook = () => {
    if (!user) {
      toast.error("Please sign in to book");
      return;
    }
    setBookOpen(true);
    feedbackRepo.record(user.id, h.id, "booked");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-col md:flex-row">
        <Link to={`/hostel/${h.id}`} className="relative block md:w-64">
          <img src={cover} alt={h.name} className="h-48 w-full object-cover md:h-full" />
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow">
            <Sparkles className="h-3 w-3" /> #{rank}
          </div>
          <div
            data-testid="match-score"
            className="absolute right-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-bold text-primary shadow"
          >
            {item.overall}% Match
          </div>
        </Link>

        <div className="flex-1 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link to={`/hostel/${h.id}`} className="text-lg font-semibold text-foreground hover:text-primary">
                {h.name}
              </Link>
              <p className="text-sm text-muted-foreground">{h.location}, {h.city}</p>
              {item.distanceKm != null && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.distanceKm < 1
                    ? `${Math.round(item.distanceKm * 1000)} m`
                    : `${item.distanceKm.toFixed(1)} km`}{" "}
                  away
                  {item.eta ? ` · ${item.eta.walk} min walk · ${item.eta.bike} min bike · ${item.eta.car} min drive` : ""}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">₹{h.price.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <SafetyBadge safety={item.safety} />
            <TrustBadge trust={item.trust} />
            {item.explanation.bestFor.map((b) => (
              <span key={b} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                Best for {b}
              </span>
            ))}
          </div>

          <div className="mt-3">
            <ConfidenceMeter confidence={item.confidence} />
          </div>

          {item.explanation.reasons[0] && (
            <p className="mt-3 line-clamp-2 text-sm text-foreground">
              {item.explanation.reasons[0]}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={onBook}>Book</Button>
            <Button size="sm" variant="outline" onClick={onSave}>
              <Bookmark className="mr-1 h-4 w-4" />
              {isFav ? "Saved" : "Save"}
            </Button>
            <Button
              size="sm"
              variant={inCompare ? "default" : "outline"}
              onClick={onCompare}
            >
              <GitCompareArrows className="mr-1 h-4 w-4" />
              {inCompare ? "In compare" : "Compare"}
            </Button>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Why recommended
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {expanded && (
            <div className="mt-4">
              <ExplanationPanel explanation={item.explanation} sub={item.subScores} />
            </div>
          )}
        </div>
      </div>

      <BookingDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        hostelId={h.id}
        hostelName={h.name}
        ownerId={h.owner_id}
        monthlyRent={h.price}
        availableRooms={h.available_rooms ?? 0}
      />
    </motion.article>
  );
}