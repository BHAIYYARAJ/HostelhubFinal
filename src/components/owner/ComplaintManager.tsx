import { useState } from "react";
import { Loader2, MessageSquareWarning, Send } from "lucide-react";
import { useOwnerComplaints } from "@/hooks/useComplaints";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ComplaintStatusBadge from "@/components/complaints/ComplaintStatusBadge";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function ComplaintManager() {
  const { data: complaints = [], isLoading } = useOwnerComplaints();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("complaints").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Status updated");
  };

  const sendReply = async (id: string) => {
    const txt = (drafts[id] || "").trim();
    if (!txt) { toast.error("Reply cannot be empty"); return; }
    setSaving(id);
    const { error } = await supabase.from("complaints").update({
      owner_response: txt.slice(0, 2000),
      responded_at: new Date().toISOString(),
      status: "in_progress",
    }).eq("id", id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    setDrafts((d) => ({ ...d, [id]: "" }));
    toast.success("Reply sent");
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <MessageSquareWarning className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">No complaints yet</h3>
        <p className="text-sm text-muted-foreground">Issues raised by students will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((c) => (
        <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{c.title}</h4>
                <ComplaintStatusBadge status={c.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {c.hostel?.name} · <span className="capitalize">{c.category.replace("_", " ")}</span> ·{" "}
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </div>
            <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{c.description}</p>

          {c.owner_response && (
            <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">YOUR REPLY · {c.responded_at && new Date(c.responded_at).toLocaleString()}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{c.owner_response}</p>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <Textarea
              rows={2}
              placeholder={c.owner_response ? "Send another update…" : "Write a reply to the student…"}
              value={drafts[c.id] || ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
              maxLength={2000}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => sendReply(c.id)} disabled={saving === c.id} className="gap-1.5">
                {saving === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send reply
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}