import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  hostelId: string;
  hostelName: string;
  ownerId: string | null | undefined;
  monthlyRent: number;
  availableRooms: number;
}

const BookingDialog = ({ open, onClose, hostelId, hostelName, ownerId, monthlyRent, availableRooms }: Props) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [roomType, setRoomType] = useState("Single");
  const [moveIn, setMoveIn] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setRoomType("Single"); setMoveIn(""); setPhone(""); setNotes(""); setDone(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to book"); navigate("/login"); return; }
    if (user.role === "owner") { toast.error("Owners cannot book hostels"); return; }
    if (!ownerId) { toast.error("Owner info missing for this hostel"); return; }
    if (!moveIn) { toast.error("Please pick a move-in date"); return; }
    if (availableRooms <= 0) { toast.error("No rooms available right now"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      hostel_id: hostelId,
      student_id: user.id,
      owner_id: ownerId,
      student_name: user.name,
      student_email: user.email,
      student_phone: phone.trim() || null,
      room_type: roomType,
      move_in_date: moveIn,
      monthly_rent: monthlyRent,
      notes: notes.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message || "Failed to submit booking"); return; }
    qc.invalidateQueries({ queryKey: ["bookings"] });
    setDone(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative z-10 my-auto w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-background p-6 sm:p-8 shadow-2xl ring-1 ring-border"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <div className="mb-6 pr-8 text-center">
              <h2 id="booking-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {done ? "Request sent" : "Book Your Stay"}
              </h2>
              {!done && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{hostelName}</span> · {availableRooms} room{availableRooms === 1 ? "" : "s"} left
                </p>
              )}
            </div>

            {done ? (
              <div className="py-4 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                <p className="mt-4 font-medium text-foreground">Your booking request was submitted</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We've notified the owner of {hostelName}. Track status in My Bookings.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
                  <Button className="flex-1" onClick={() => { handleClose(); navigate("/my-bookings"); }}>
                    View bookings
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Room type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Triple">Triple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="movein">Move-in date</Label>
                  <Input id="movein" type="date" className="h-11" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} min={new Date().toISOString().slice(0, 10)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" className="h-11" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" maxLength={20} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Note to owner (optional)</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={300} />
                </div>

                <div className="rounded-xl bg-secondary p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly rent</span>
                    <span className="text-base font-semibold tabular-nums text-foreground">₹{monthlyRent.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full gap-2 text-base font-semibold shadow-md"
                  disabled={submitting || availableRooms <= 0}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {availableRooms <= 0 ? "No rooms available" : "Confirm Booking"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingDialog;