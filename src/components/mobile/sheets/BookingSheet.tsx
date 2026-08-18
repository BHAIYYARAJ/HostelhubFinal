import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppSheet } from "@/components/mobile/AppSheet";
import { AppButton, Segmented } from "@/components/mobile/MobileKit";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";
import { useAuthStore } from "@/store/useAuthStore";

/** Mobile bottom-sheet version of the booking flow (same insert as desktop). */
export function BookingSheet({
  open,
  onOpenChange,
  hostelId,
  hostelName,
  ownerId,
  monthlyRent,
  availableRooms,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelId: string;
  hostelName: string;
  ownerId: string | null | undefined;
  monthlyRent: number;
  availableRooms: number;
}) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [roomType, setRoomType] = useState("Single");
  const [moveIn, setMoveIn] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setDone(false);
      setRoomType("Single");
      setMoveIn("");
      setPhone("");
      setNotes("");
    }, 250);
  };

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in to book");
      navigate("/login");
      return;
    }
    if (user.role === "owner") {
      toast.error("Owners cannot book hostels");
      return;
    }
    if (!ownerId) {
      toast.error("Owner info missing for this hostel");
      return;
    }
    if (!moveIn) {
      toast.error("Please pick a move-in date");
      return;
    }
    if (availableRooms <= 0) {
      toast.error("No rooms available right now");
      return;
    }

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
    if (error) {
      toast.error(error.message || "Failed to submit booking");
      return;
    }
    qc.invalidateQueries({ queryKey: ["bookings"] });
    setDone(true);
  };

  return (
    <AppSheet
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : close())}
      title={done ? "Request sent" : "Book your stay"}
      description={
        done
          ? undefined
          : `${hostelName} · ${availableRooms} room${availableRooms === 1 ? "" : "s"} left`
      }
      footer={
        done ? (
          <div className="flex gap-3">
            <AppButton variant="secondary" onClick={close}>
              Close
            </AppButton>
            <AppButton
              onClick={() => {
                close();
                navigate("/my-bookings");
              }}
            >
              View bookings
            </AppButton>
          </div>
        ) : (
          <AppButton onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send booking request"}
          </AppButton>
        )
      }
    >
      {done ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <p className="mt-4 text-[15px] font-bold text-foreground">Booking request submitted</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            We've notified the owner of {hostelName}. Track the status in Bookings.
          </p>
        </div>
      ) : (
        <div className="space-y-5 pb-2">
          <div>
            <p className="mb-2 text-[13px] font-bold tracking-tight text-foreground">Room type</p>
            <Segmented
              value={roomType}
              onChange={setRoomType}
              options={[
                { value: "Single", label: "Single" },
                { value: "Double", label: "Double" },
                { value: "Triple", label: "Triple" },
              ]}
            />
          </div>

          <Field label="Move-in date">
            <input
              type="date"
              value={moveIn}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setMoveIn(e.target.value)}
              className="h-14 w-full rounded-2xl bg-muted px-4 text-[15px] font-medium outline-none"
            />
          </Field>

          <Field label="Phone (optional)">
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="h-14 w-full rounded-2xl bg-muted px-4 text-[15px] font-medium outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the owner should know?"
              className="w-full rounded-2xl bg-muted p-4 text-[15px] font-medium outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <div className="flex items-center justify-between rounded-2xl bg-coral-light px-4 py-3">
            <span className="text-[13px] font-semibold text-foreground">Monthly rent</span>
            <span className="text-[17px] font-extrabold text-primary">
              ₹{Number(monthlyRent).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}
    </AppSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-bold tracking-tight text-foreground">{label}</span>
      {children}
    </label>
  );
}
