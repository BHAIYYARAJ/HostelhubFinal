import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Heart,
  Loader2,
  MapPin,
  MessageSquareWarning,
  Navigation,
  QrCode,
  Share2,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AppScreen } from "@/components/mobile/AppScreen";
import { AppSheet, StickyActionBar } from "@/components/mobile/AppSheet";
import { AppButton, AppCard, EmptyState, ListGroup, ListRow } from "@/components/mobile/MobileKit";
import { BookingSheet } from "@/components/mobile/sheets/BookingSheet";
import { ComplaintSheet } from "@/components/mobile/sheets/ComplaintSheet";
import OwnerInfoCard from "@/components/OwnerInfoCard";
import ReviewSection from "@/components/ReviewSection";
import RouteNavigatorClient from "@/components/RouteNavigatorClient";
import UpiQrCode from "@/components/UpiQrCode";
import { supabase } from "@/integrations/supabase/client";
import { getHostelCoords } from "@/lib/hostelCoords";
import { useAuthStore } from "@/store/useAuthStore";
import { useHostelById } from "@/hooks/useHostels";
import { useReviews } from "@/hooks/useReviews";
import { useNavigate, useParams } from "@/lib/router-compat";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import HostelDetailGallery from "@/components/HostelDetailGallery";

export function HostelDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: hostel, isLoading } = useHostelById(id);
  const { data: reviews } = useReviews(id);

  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const [bookOpen, setBookOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [routeOpen, setRouteOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [upiId, setUpiId] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hostel?.id || !user) {
      setUpiId(null);
      return;
    }
    supabase
      .from("hostel_upi")
      .select("upi_id")
      .eq("hostel_id", hostel.id)
      .maybeSingle()
      .then(({ data }) => setUpiId(data?.upi_id ?? null));
  }, [hostel?.id, user]);

  if (isLoading) {
    return (
      <AppScreen withTabBar={false}>
        <div className="grid h-[100dvh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppScreen>
    );
  }

  if (!hostel) {
    return (
      <AppScreen withTabBar={false}>
        <EmptyState
          icon={Building2}
          title="Hostel not found"
          body="This listing may have been removed."
          action={<AppButton to="/">Back to home</AppButton>}
        />
      </AppScreen>
    );
  }

  const saved = favorites.includes(hostel.id);
  const images = hostel.images?.length ? hostel.images : [""];
  const available = hostel.available_rooms ?? 0;
  const coords = getHostelCoords(hostel);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: hostel.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <AppScreen withTabBar={false} className="pb-32">
      {/* Gallery */}
      <HostelDetailGallery images={hostel.images} alt={hostel.name} heightClassName="h-[320px]" className="rounded-none" />

      {/* Title block */}
      <div className="relative -mt-6 rounded-t-[28px] bg-app-canvas px-4 pt-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-foreground">
              {hostel.name}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {hostel.location}, {hostel.city}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReviewsOpen(true)}
            className="tap shrink-0 rounded-2xl bg-app-surface px-3 py-2 text-center shadow-app-card"
          >
            <span className="flex items-center gap-1 text-[15px] font-extrabold text-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {Number(hostel.rating ?? 0).toFixed(1)}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold text-muted-foreground">
              {hostel.review_count ?? 0} reviews
            </span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MetaTile icon={Users} label="Type" value={hostel.type} />
          <MetaTile icon={Building2} label="Occupancy" value={hostel.occupancy || "—"} />
          <MetaTile icon={ShieldCheck} label="Available" value={`${available} rooms`} />
        </div>

        {hostel.description && (
          <AppCard className="mt-4">
            <p className="text-[13px] font-bold tracking-tight text-foreground">About this stay</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {hostel.description}
            </p>
          </AppCard>
        )}

        {!!hostel.facilities?.length && (
          <AppCard className="mt-4">
            <p className="text-[13px] font-bold tracking-tight text-foreground">Facilities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {hostel.facilities.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-semibold text-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          </AppCard>
        )}

        {!!hostel.rules?.length && (
          <AppCard className="mt-4">
            <p className="text-[13px] font-bold tracking-tight text-foreground">House rules</p>
            <ul className="mt-2 space-y-1.5">
              {hostel.rules.map((r) => (
                <li key={r} className="flex gap-2 text-[13px] text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </AppCard>
        )}

        <div className="mt-4">
          <OwnerInfoCard
            ownerName={hostel.owner_name || "Property owner"}
            ownerId={hostel.owner_id ?? undefined}
            hostelId={hostel.id}
            hostelName={hostel.name}
          />
        </div>

        <div className="mt-4">
          <ListGroup>
            <ListRow
              icon={Star}
              title="Reviews"
              subtitle={`${reviews?.length ?? 0} from residents`}
              onClick={() => setReviewsOpen(true)}
            />
            <ListRow
              icon={Navigation}
              title="Location & directions"
              subtitle={coords ? "Live route, travel time and nearby places" : "Location not mapped yet"}
              onClick={() => (coords ? setRouteOpen(true) : toast.info("This listing has no map location yet"))}
            />
            {upiId && (
              <ListRow
                icon={QrCode}
                title="Pay via UPI"
                subtitle="Scan the owner's QR code"
                onClick={() => setQrOpen(true)}
              />
            )}
            <ListRow
              icon={MessageSquareWarning}
              title="Raise a complaint"
              subtitle="Report an issue with this hostel"
              onClick={() => setComplaintOpen(true)}
            />
          </ListGroup>
        </div>
      </div>

      <StickyActionBar>
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[19px] font-extrabold leading-none tracking-tight text-foreground">
              ₹{Number(hostel.price).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] font-semibold text-muted-foreground">per month</p>
          </div>
          <div className="flex-1">
            <AppButton onClick={() => setBookOpen(true)} disabled={available <= 0}>
              {available > 0 ? "Book Now" : "Fully booked"}
            </AppButton>
          </div>
        </div>
      </StickyActionBar>

      <BookingSheet
        open={bookOpen}
        onOpenChange={setBookOpen}
        hostelId={hostel.id}
        hostelName={hostel.name}
        ownerId={hostel.owner_id}
        monthlyRent={hostel.price}
        availableRooms={available}
      />

      <ComplaintSheet
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        hostelId={hostel.id}
        hostelName={hostel.name}
        ownerId={hostel.owner_id ?? undefined}
      />

      <AppSheet
        open={reviewsOpen}
        onOpenChange={setReviewsOpen}
        title="Reviews"
        description={`${reviews?.length ?? 0} verified residents`}
      >
        <div className="pb-4">
          <ReviewSection
            hostelId={hostel.id}
            hostelName={hostel.name}
            ownerId={hostel.owner_id}
          />
        </div>
        {!reviews?.length ? (
          <EmptyState icon={Star} title="No reviews yet" body="Be the first to review after your stay." />
        ) : (
          <div className="space-y-3 pb-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl bg-muted/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold tracking-tight text-foreground">
                    {r.student_name || "Anonymous"}
                  </p>
                  <span className="flex items-center gap-1 text-[13px] font-bold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {r.rating}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{r.comment}</p>
                {r.owner_reply && (
                  <div className="mt-3 rounded-xl bg-app-surface p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                      Owner reply
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{r.owner_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AppSheet>

      {coords && (
        <RouteNavigatorClient
          open={routeOpen}
          onClose={() => setRouteOpen(false)}
          destination={coords}
          hostelName={hostel.name}
        />
      )}

      <AppSheet open={qrOpen} onOpenChange={setQrOpen} title="Pay via UPI">
        {upiId && (
          <div className="pb-4">
            <UpiQrCode upiId={upiId} amount={Number(hostel.price)} payeeName={hostel.owner_name || "Owner"} />
          </div>
        )}
      </AppSheet>
    </AppScreen>
  );
}

function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-app-surface p-3 shadow-app-card">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1.5 truncate text-[13px] font-bold capitalize tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
