import { Heart, MapPin, Star, Wifi, Wind, UtensilsCrossed } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { HostelImageCarousel } from "@/components/HostelImageCarousel";

const facilityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  AC: <Wind className="h-3.5 w-3.5" />,
  Mess: <UtensilsCrossed className="h-3.5 w-3.5" />,
};

interface HostelLike {
  id: string;
  name: string;
  location: string;
  city: string;
  price: number;
  rating: number;
  review_count?: number;
  reviewCount?: number;
  distance_from_college?: string;
  distanceFromCollege?: string;
  images: string[];
  facilities: string[];
  type: "boys" | "girls" | "co-ed";
  is_featured?: boolean;
  isFeatured?: boolean;
}

interface Props {
  hostel: HostelLike;
  index?: number;
  distanceKm?: number;
  travelMin?: number;
}

const HostelCard = ({ hostel, index = 0, distanceKm, travelMin }: Props) => {
  const { favorites, toggleFavorite } = useAppStore();
  const navigate = useNavigate();
  const isFav = favorites.includes(hostel.id);

  const reviewCount = hostel.review_count ?? hostel.reviewCount ?? 0;
  const distance = hostel.distance_from_college ?? hostel.distanceFromCollege ?? "";
  const featured = hostel.is_featured ?? hostel.isFeatured ?? false;
  const images = Array.isArray(hostel.images) ? hostel.images : [];
  const facilities = Array.isArray(hostel.facilities) ? hostel.facilities : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <Link
        to={`/hostel/${hostel.id}`}
        className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <HostelImageCarousel
            images={images}
            alt={hostel.name}
            imageClassName="transition-transform duration-500 group-hover:scale-105"
          />
          {typeof distanceKm === "number" && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
              📍 {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}
              {typeof travelMin === "number" && <span className="text-muted-foreground">· {travelMin} min</span>}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(hostel.id);
            }}
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all hover:bg-background active:scale-[0.95]"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFav ? "fill-primary text-primary" : "text-foreground"}`}
            />
          </button>
          <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium capitalize backdrop-blur-sm">
            {hostel.type}
          </span>
          {featured && (
            <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Featured
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-1">
              {hostel.name}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              <span className="text-sm font-medium tabular-nums">{hostel.rating}</span>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          </div>

          <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{hostel.location}</span>
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {facilities.slice(0, 4).map((f) => (
              <span
                key={f}
                className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
              >
                {facilityIcons[f] || null}
                {f}
              </span>
            ))}
            {facilities.length > 4 && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                +{facilities.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-lg font-bold text-foreground tabular-nums">₹{hostel.price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            {distance && (
              <span className="text-xs text-muted-foreground">{distance} from college</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/hostel/${hostel.id}#book`);
            }}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Book now
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default HostelCard;
