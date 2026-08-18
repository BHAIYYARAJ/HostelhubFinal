import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";

interface Props {
  open: boolean;
  onClose: () => void;
  hostelId: string;
  hostelName: string;
  ownerId?: string;
}

const CATEGORIES = [
  { value: "maintenance", label: "Maintenance" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "safety", label: "Safety / Security" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
] as const;

export default function ComplaintDialog({ open, onClose, hostelId, hostelName, ownerId }: Props) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [category, setCategory] = useState<typeof CATEGORIES[number]["value"]>("maintenance");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setCategory("maintenance"); setTitle(""); setDescription(""); };

  const submit = async () => {
    if (!user) { toast.error("Please log in first"); navigate("/login"); return; }
    if (!ownerId) { toast.error("Owner unavailable"); return; }
    if (!title.trim() || title.trim().length < 4) { toast.error("Title must be at least 4 characters"); return; }
    if (!description.trim() || description.trim().length < 10) { toast.error("Please describe the issue (min 10 chars)"); return; }
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
    if (error) { toast.error(error.message); return; }
    toast.success("Complaint submitted. The owner will be notified.");
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" /> Raise a complaint
          </DialogTitle>
          <DialogDescription>About {hostelName}. The owner will respond and you can track the status.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leaking tap in bathroom" maxLength={150} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail…"
              maxLength={2000}
            />
            <p className="text-right text-xs text-muted-foreground">{description.length}/2000</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}