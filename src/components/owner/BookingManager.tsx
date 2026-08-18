import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, Clock, Mail, Phone, CalendarDays, Home, MessageSquare, Loader2, Ban } from "lucide-react";
import { useOwnerBookings, updateBookingStatus, BookingStatus, Booking } from "@/hooks/useBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";

const statusConfig: Record<BookingStatus, { label: string; class: string; icon: typeof Clock }> = {
  pending:   { label: "Pending",   class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmed", class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Check },
  rejected:  { label: "Rejected",  class: "bg-red-50 text-red-600 border-red-200", icon: X },
  cancelled: { label: "Cancelled", class: "bg-muted text-muted-foreground border-border", icon: Ban },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const BookingManager = () => {
  const { data: bookings = [], isLoading } = useOwnerBookings();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "confirmed" | "rejected" } | null>(null);
  const [acting, setActing] = useState(false);

  const navigate = useNavigate();

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  );
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const openStudentChat = async (booking: Booking) => {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("student_id", booking.student_id)
        .eq("owner_id", booking.owner_id)
        .eq("hostel_id", booking.hostel_id)
        .maybeSingle();
      if (error) throw error;
      if (!data?.id) {
        toast.info("No chat exists yet. The student can start one from the hostel listing.");
        return;
      }
      navigate(`/owner/chats/${data.id}`);
    } catch (e: any) {
      toast.error(e?.message || "Could not open chat");
    }
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    setActing(true);
    try {
      await updateBookingStatus(confirmAction.id, confirmAction.action);
      toast.success(confirmAction.action === "confirmed" ? "Booking confirmed" : "Booking rejected");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update booking");
    } finally {
      setActing(false);
      setConfirmAction(null);
    }
  };

  const filters: { value: BookingStatus | "all"; label: string; count?: number }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending", count: pendingCount },
    { value: "confirmed", label: "Confirmed" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Booking Requests</h3>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} pending request${pendingCount !== 1 ? "s" : ""} awaiting your response`
              : "No pending requests"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[10px]">
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 rounded-full bg-muted p-4">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No bookings found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter !== "all" ? "Try a different filter" : "New requests will appear here in real time"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((b) => {
            const status = statusConfig[b.status];
            const StatusIcon = status.icon;
            const initials = b.student_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div key={b.id} className="px-6 py-4 transition-colors hover:bg-muted/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials || "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{b.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested {fmtDate(b.created_at)} at {fmtTime(b.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Home className="h-3 w-3" /> {b.hostel?.name || "Hostel"}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Move-in: {fmtDate(b.move_in_date)}</span>
                      <span>Room: {b.room_type}</span>
                      <span className="font-medium text-foreground tabular-nums">₹{Number(b.monthly_rent).toLocaleString("en-IN")}/mo</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {b.student_email && (
                        <a href={`mailto:${b.student_email}`} className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" /> {b.student_email}</a>
                      )}
                      {b.student_phone && (
                        <a href={`tel:${b.student_phone}`} className="inline-flex items-center gap-1 hover:text-foreground"><Phone className="h-3 w-3" /> {b.student_phone}</a>
                      )}
                    </div>

                    {b.notes && (
                      <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">"{b.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2.5">
                    <Badge variant="outline" className={`gap-1 ${status.class}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>

                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setConfirmAction({ id: b.id, action: "confirmed" })} className="h-8 gap-1.5 text-xs">
                          <Check className="h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: b.id, action: "rejected" })} className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive">
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}

                    <Button size="sm" variant="ghost" onClick={() => openStudentChat(b)} className="h-8 gap-1.5 text-xs">
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={() => !acting && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "confirmed" ? "Confirm booking?" : "Reject booking?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === "confirmed"
                ? "The student will be notified and one room will be reserved from availability."
                : "The student will be notified that their booking request was declined."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleAction(); }}
              disabled={acting}
              className={confirmAction?.action === "rejected" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmAction?.action === "confirmed" ? "Confirm" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
};

export default BookingManager;