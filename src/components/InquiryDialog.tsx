import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateInquiry } from "@/hooks/useInquiries";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  hostelId: string;
  hostelName: string;
  ownerId: string;
  ownerName: string;
}

const QUICK = [
  "Is the room available for the upcoming semester?",
  "What is the deposit policy?",
  "Can I schedule a visit this weekend?",
  "Are meals included in the rent?",
];

const schema = z.object({
  subject: z.string().trim().min(3, "Subject too short").max(120),
  message: z.string().trim().min(10, "Add more detail (min 10 chars)").max(1000),
});

const InquiryDialog = ({ open, onClose, hostelId, hostelName, ownerId, ownerName }: Props) => {
  const user = useAuthStore((s) => s.user);
  const createInquiry = useCreateInquiry();
  const [subject, setSubject] = useState(`Inquiry about ${hostelName}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to send an inquiry");
      return;
    }
    const parsed = schema.safeParse({ subject, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    try {
      await createInquiry({ hostelId, ownerId, subject: parsed.data.subject, message: parsed.data.message });
      toast.success(`Inquiry sent to ${ownerName}`);
      setMessage("");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to send inquiry");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {ownerName}</DialogTitle>
          <DialogDescription>
            Ask any question about {hostelName} — no booking required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subj">Subject</Label>
            <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd like to know more about..."
              rows={5}
              maxLength={1000}
            />
            <p className="text-right text-[11px] text-muted-foreground">{message.length}/1000</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setMessage((m) => (m ? `${m}\n${q}` : q))}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground transition-colors hover:bg-secondary/70"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={sending} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Inquiry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryDialog;