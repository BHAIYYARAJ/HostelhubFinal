import { Link, Navigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Home, Loader2, Ban, Check, X, Clock, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudentBookings, updateBookingStatus, BookingStatus } from "@/hooks/useBookings";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusConfig: Record<BookingStatus, { label: string; class: string; icon: typeof Clock }> = {
  pending:   { label: "Pending",   class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmed", class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Check },
  rejected:  { label: "Rejected",  class: "bg-red-50 text-red-600 border-red-200", icon: X },
  cancelled: { label: "Cancelled", class: "bg-muted text-muted-foreground border-border", icon: Ban },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const MyBookings = () => {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const { data: bookings = [], isLoading } = useStudentBookings();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  if (initialized && !user) return <Navigate to="/login" replace />;

  const onCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await updateBookingStatus(cancelId, "cancelled");
      toast.success("Booking cancelled");
    } catch (e: any) {
      toast.error(e?.message || "Failed to cancel");
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every booking request you've made.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading your bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <div className="mb-3 rounded-full bg-muted p-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No bookings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse hostels and click Book Now to send your first request.</p>
            <Link to="/" className="mt-4">
              <Button>Explore hostels</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => {
              const status = statusConfig[b.status];
              const Icon = status.icon;
              const img = b.hostel?.images?.[0];
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center"
                >
                  {img && (
                    <Link to={`/hostel/${b.hostel_id}`} className="shrink-0">
                      <img src={img} alt="" className="h-24 w-full rounded-lg object-cover sm:w-32" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/hostel/${b.hostel_id}`} className="font-semibold text-foreground hover:underline">
                          {b.hostel?.name || "Hostel"}
                        </Link>
                        {b.hostel?.location && (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {b.hostel.location}, {b.hostel.city}
                          </p>
                        )}
                        {(b as any).ref_id && (
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {(b as any).ref_id}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`gap-1 shrink-0 ${status.class}`}>
                        <Icon className="h-3 w-3" /> {status.label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Home className="h-3 w-3" /> {b.room_type}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Move-in: {fmt(b.move_in_date)}</span>
                      <span className="font-medium text-foreground tabular-nums">₹{Number(b.monthly_rent).toLocaleString("en-IN")}/mo</span>
                      <span>Requested {fmt(b.created_at)}</span>
                    </div>
                    {b.status === "pending" && (
                      <div className="mt-3">
                        <Button size="sm" variant="outline" onClick={() => setCancelId(b.id)} className="gap-1.5 text-destructive hover:text-destructive">
                          <Ban className="h-3.5 w-3.5" /> Cancel request
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!cancelId} onOpenChange={() => !cancelling && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking request?</AlertDialogTitle>
            <AlertDialogDescription>This will withdraw your pending request. You can submit a new one later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep request</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); onCancel(); }}
            >
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookings;