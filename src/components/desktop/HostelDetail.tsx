import { useParams, Link } from "@/lib/router-compat";
import { ArrowLeft, Heart, MapPin, Star, Share2, Check, Shield, Loader2, AlertCircle, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useHostelById } from "@/hooks/useHostels";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import OwnerInfoCard from "@/components/OwnerInfoCard";
import UpiQrCode from "@/components/UpiQrCode";
import ComplaintDialog from "@/components/ComplaintDialog";
import RouteNavigator from "@/components/RouteNavigatorClient";
import BookingDialog from "@/components/BookingDialog";
import { getHostelCoords } from "@/lib/hostelCoords";
import HostelDetailGallery from "@/components/HostelDetailGallery";
import { toast } from "sonner";

const HostelDetail = () => {
  const { id } = useParams();
  const { data: hostel, isLoading } = useHostelById(id);
  const { favorites, toggleFavorite } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [upiId, setUpiId] = useState<string | null>(null);

  useEffect(() => {
    if (!hostel?.id || !user) { setUpiId(null); return; }
    supabase
      .from("hostel_upi")
      .select("upi_id")
      .eq("hostel_id", hostel.id)
      .maybeSingle()
      .then(({ data }) => setUpiId(data?.upi_id ?? null));
  }, [hostel?.id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading hostel details...</p>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-2xl font-bold">Hostel not found</h2>
          <Link to="/" className="mt-4 text-sm text-primary underline">Back to listings</Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(hostel.id);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: hostel.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />

      <div className="container py-6 md:py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mb-8">
          <HostelDetailGallery images={hostel.images} alt={hostel.name} heightClassName="h-[320px] md:h-[480px]" />
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-2"
          >
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
                  {hostel.name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {hostel.location}, {hostel.city}
                </p>
                {(hostel as any).ref_id && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {(hostel as any).ref_id}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(hostel.id)}
                  className="rounded-full border border-border p-2.5 transition-colors hover:bg-secondary active:scale-[0.95]"
                >
                  <Heart className={`h-5 w-5 ${isFav ? "fill-primary text-primary" : "text-foreground"}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-full border border-border p-2.5 transition-colors hover:bg-secondary active:scale-[0.95]"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="font-semibold tabular-nums">{hostel.rating}</span>
                <span className="text-muted-foreground">({hostel.review_count} reviews)</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="capitalize text-muted-foreground">{hostel.type} hostel</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{hostel.occupancy} occupancy</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{hostel.distance_from_college} from college</span>
            </div>

            <hr className="my-6 border-border" />

            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">About this hostel</h2>
              <p className="leading-relaxed text-muted-foreground">{hostel.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Facilities</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {hostel.facilities.map((f) => (
                  <div key={f} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-foreground">House rules</h2>
              <ul className="space-y-2">
                {hostel.rules.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-8 border-border" />
            <ReviewSection hostelId={hostel.id} hostelName={hostel.name} ownerId={hostel.owner_id} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="space-y-4"
          >
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4">
                  <span className="text-2xl font-bold tabular-nums text-foreground">₹{hostel.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>

                <div className="mb-4 rounded-xl border border-border">
                  <div className="border-b border-border px-4 py-3">
                    <label className="text-xs font-medium text-muted-foreground">MOVE-IN DATE</label>
                    <input type="date" className="mt-1 w-full bg-transparent text-sm text-foreground focus:outline-none" />
                  </div>
                  <div className="px-4 py-3">
                    <label className="text-xs font-medium text-muted-foreground">OCCUPANCY</label>
                    <select className="mt-1 w-full bg-transparent text-sm text-foreground focus:outline-none">
                      <option>Single</option>
                      <option>Double</option>
                      <option>Triple</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const available = (hostel as any).available_rooms ?? 0;
                  const total = (hostel as any).total_rooms ?? 0;
                  const soldOut = available <= 0;
                  return (
                    <>
                      <div className="mb-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Room availability</span>
                        <span className={`font-semibold tabular-nums ${soldOut ? "text-destructive" : "text-emerald-600"}`}>
                          {available} / {total} available
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (!user) { toast.error("Please sign in to book"); return; }
                          if (user.role === "owner") { toast.error("Owners cannot book hostels"); return; }
                          setBookingOpen(true);
                        }}
                        disabled={soldOut}
                        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {soldOut ? "Fully booked" : "Book now"}
                      </button>
                      <p className="mt-3 text-center text-xs text-muted-foreground">No charge until owner confirms</p>
                    </>
                  );
                })()}

                <hr className="my-4 border-border" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly rent</span>
                    <span className="tabular-nums text-foreground">₹{hostel.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security deposit</span>
                    <span className="tabular-nums text-foreground">₹{(hostel.price * 2).toLocaleString()}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total to move in</span>
                    <span className="tabular-nums text-foreground">₹{(hostel.price * 3).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <OwnerInfoCard
                ownerName={hostel.owner_name}
                ownerId={hostel.owner_id ?? undefined}
                hostelId={hostel.id}
                hostelName={hostel.name}
              />

              <button
                onClick={() => {
                  if (!getHostelCoords(hostel)) {
                    toast.error("This listing has no map location yet — ask the owner to add its address");
                    return;
                  }
                  setRouteOpen(true);
                }}
                disabled={!getHostelCoords(hostel)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Navigation className="h-4 w-4" /> Show route / Get directions
              </button>

              {upiId && (
                <UpiQrCode
                  upiId={upiId}
                  amount={hostel.price * 3}
                  payeeName={hostel.owner_name}
                />
              )}

              {user && user.role !== "owner" && (
                <button
                  onClick={() => setComplaintOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" /> Raise a complaint
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />

      {/* Mobile sticky booking bar — always visible on small screens */}
      {(() => {
        const available = (hostel as any).available_rooms ?? 0;
        const soldOut = available <= 0;
        const isOwner = user?.role === "owner";
        return (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-elevated backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-bold text-foreground tabular-nums">
                  ₹{hostel.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>
                <div className={`text-[11px] font-medium ${soldOut ? "text-destructive" : "text-emerald-600"}`}>
                  {soldOut ? "Fully booked" : `${available} room${available === 1 ? "" : "s"} left`}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!user) { toast.error("Please sign in to book"); return; }
                  if (isOwner) { toast.error("Owners cannot book hostels"); return; }
                  setBookingOpen(true);
                }}
                disabled={soldOut || isOwner}
                className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {soldOut ? "Unavailable" : "Book now"}
              </button>
            </div>
          </div>
        );
      })()}

      <ComplaintDialog
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        hostelId={hostel.id}
        hostelName={hostel.name}
        ownerId={hostel.owner_id ?? undefined}
      />

      {getHostelCoords(hostel) && (
        <RouteNavigator
          open={routeOpen}
          onClose={() => setRouteOpen(false)}
          destination={getHostelCoords(hostel)!}
          hostelName={hostel.name}
        />
      )}

      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        hostelId={hostel.id}
        hostelName={hostel.name}
        ownerId={hostel.owner_id}
        monthlyRent={hostel.price}
        availableRooms={(hostel as any).available_rooms ?? 0}
      />
    </div>
  );
};

export default HostelDetail;
