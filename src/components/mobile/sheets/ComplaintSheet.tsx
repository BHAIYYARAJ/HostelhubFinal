import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppSheet } from "@/components/mobile/AppSheet";
import { AppButton, Chip } from "@/components/mobile/MobileKit";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";
import { useAuthStore } from "@/store/useAuthStore";

const CATEGORIES = [
  { value: "maintenance", label: "Maintenance" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "safety", label: "Safety" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

/** Mobile bottom-sheet complaint form (same insert as the desktop dialog). */
export function ComplaintSheet({
  open,
  onOpenChange,
  hostelId,
  hostelName,
  ownerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelId: string;
  hostelName: string;
  ownerId?: string | null;
}) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [category, setCategory] = useState<Category>("maintenance");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }
    if (!ownerId) {
      toast.error("Owner unavailable");
      return;
    }
    if (title.trim().length < 4) {
      toast.error("Title must be at least 4 characters");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Please describe the issue (min 10 chars)");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("complaints").insert({
      student_id: user.id,
      owner_id: ownerId,
      hostel_id: hostelId,
      category,
      title: title.trim().slice(0, 150),
      description: description.trim().slice(0, 2000),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["complaints"] });
    toast.success("Complaint submitted. The owner will be notified.");
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Raise a complaint"
      description={`About ${hostelName}. The owner will respond and you can track the status.`}
      footer={
        <AppButton onClick={submit} disabled={submitting}>
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit complaint"}
        </AppButton>
      }
    >
      <div className="space-y-5 pb-2">
        <div>
          <p className="mb-2 text-[13px] font-bold tracking-tight text-foreground">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-[13px] font-bold tracking-tight text-foreground">Title</span>
          <input
            value={title}
            maxLength={150}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Leaking tap in bathroom"
            className="h-14 w-full rounded-2xl bg-muted px-4 text-[15px] font-medium outline-none placeholder:text-muted-foreground"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[13px] font-bold tracking-tight text-foreground">
            Description
          </span>
          <textarea
            rows={5}
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail…"
            className="w-full rounded-2xl bg-muted p-4 text-[15px] font-medium outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
    </AppSheet>
  );
}
