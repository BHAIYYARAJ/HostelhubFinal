import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Mail, MessageSquare, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useOwnerInquiries,
  replyInquiry,
  setInquiryStatus,
  type Inquiry,
  type InquiryStatus,
} from "@/hooks/useInquiries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const QUICK_REPLIES = [
  "Yes, the room is available. When would you like to move in?",
  "Thanks for your interest! Please share your contact number so I can call you.",
  "Unfortunately the room is currently booked. I'll let you know if it opens up.",
  "You're welcome to visit. We're open 10am - 7pm any day.",
];

const statusMeta: Record<InquiryStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  replied: { label: "Replied", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2 },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground", icon: XCircle },
};

const InquiryManager = () => {
  const user = useAuthStore((s) => s.user);
  const { data: inquiries = [], isLoading } = useOwnerInquiries(user?.id);
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const filtered = inquiries.filter((i) => filter === "all" || i.status === filter);
  const counts = {
    all: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  const handleReply = async (inq: Inquiry) => {
    const text = (replyDrafts[inq.id] || inq.reply || "").trim();
    if (text.length < 5) {
      toast.error("Write a longer reply");
      return;
    }
    setSubmitting(inq.id);
    try {
      await replyInquiry(inq.id, text);
      toast.success("Reply sent");
      setReplyDrafts((d) => ({ ...d, [inq.id]: "" }));
    } catch (e: any) {
      toast.error(e?.message || "Failed to send reply");
    } finally {
      setSubmitting(null);
    }
  };

  const handleClose = async (inq: Inquiry) => {
    try {
      await setInquiryStatus(inq.id, "closed");
      toast.success("Inquiry closed");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "replied", "closed"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === k ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70"
            }`}
          >
            {k} <span className="ml-1 opacity-70">({counts[k]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <Mail className="mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">No inquiries</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When students send questions, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => {
            const sMeta = statusMeta[inq.status];
            const StatusIcon = sMeta.icon;
            const draft = replyDrafts[inq.id] ?? inq.reply ?? "";
            const initials = (inq.student?.full_name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={inq.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20">
                      {inq.student?.avatar_url ? (
                        <img src={inq.student.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{inq.student?.full_name || "Student"}</p>
                      <p className="text-xs text-muted-foreground">
                        {inq.hostel?.name || "Listing"} · {formatDistanceToNow(new Date(inq.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge className={`gap-1 ${sMeta.className}`} variant="secondary">
                    <StatusIcon className="h-3 w-3" /> {sMeta.label}
                  </Badge>
                </div>

                <h4 className="mt-4 text-sm font-semibold text-foreground">{inq.subject}</h4>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {inq.message}
                </p>

                {inq.status !== "closed" && (
                  <div className="mt-4 space-y-3 rounded-lg bg-secondary/40 p-3">
                    <Textarea
                      placeholder="Write a reply..."
                      value={draft}
                      onChange={(e) => setReplyDrafts((d) => ({ ...d, [inq.id]: e.target.value }))}
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_REPLIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => setReplyDrafts((d) => ({ ...d, [inq.id]: q }))}
                          className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-foreground hover:bg-secondary"
                        >
                          {q.slice(0, 36)}{q.length > 36 ? "…" : ""}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleClose(inq)}>
                        Close
                      </Button>
                      <Button size="sm" onClick={() => handleReply(inq)} disabled={submitting === inq.id} className="gap-1.5">
                        {submitting === inq.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        {inq.status === "replied" ? "Update reply" : "Send reply"}
                      </Button>
                    </div>
                  </div>
                )}

                {inq.status === "closed" && inq.reply && (
                  <div className="mt-4 rounded-lg border-l-2 border-primary/50 bg-secondary/40 px-3 py-2">
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> Your reply
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{inq.reply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InquiryManager;