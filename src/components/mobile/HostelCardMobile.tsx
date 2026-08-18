import { Heart, MapPin, Star } from "lucide-react";

import type { DbHostel } from "@/hooks/useHostels";
import { Link } from "@/lib/router-compat";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { HostelImageCarousel } from "@/components/HostelImageCarousel";

export function HostelCardMobile({ hostel }: { hostel: DbHostel }) {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const saved = favorites.includes(hostel.id);

  return (
    <Link
      to={`/hostel/${hostel.id}`}
      className="tap block overflow-hidden rounded-3xl bg-app-surface shadow-app-card"
    >
      <div className="relative h-44">
        <HostelImageCarousel
          images={hostel.images}
          alt={hostel.name}
          imageHeightClassName="h-44"
          showControls
        />
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save hostel"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(hostel.id);
          }}
          className="tap absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur-md"
        >
          <Heart
            className={cn("h-5 w-5", saved ? "fill-primary text-primary" : "text-white")}
            strokeWidth={2.4}
          />
        </button>
        {hostel.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-app-surface/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            Featured
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-app-surface/95 px-2.5 py-1 text-[11px] font-bold capitalize text-foreground">
          {hostel.type}
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <h3 className="truncate text-[16px] font-bold tracking-tight text-foreground">
            {hostel.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {Number(hostel.rating ?? 0).toFixed(1)}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {hostel.location}, {hostel.city}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <p className="text-[18px] font-extrabold tracking-tight text-foreground">
            ₹{Number(hostel.price ?? 0).toLocaleString("en-IN")}
            <span className="text-[12px] font-semibold text-muted-foreground"> /mo</span>
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {hostel.available_rooms ?? 0} rooms left
          </p>
        </div>
      </div>
    </Link>
  );
}
