import { useMemo, useState } from "react";
import { Loader2, MessageSquareWarning, Send } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppSheet, StickyActionBar } from "@/components/mobile/AppSheet";
import { AppButton, AppCard, EmptyState, Segmented, StatusPill } from "@/components/mobile/MobileKit";
import { useOwnerComplaints, type Complaint } from "@/hooks/useComplaints";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export function OwnerComplaintsScreen() {
  const { data: complaints = [], isLoading } = useOwnerComplaints();
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Complaint | null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const filtered = useMemo(
    () => (filter === "all" ? complaints : complaints.filter((c) => c.status === filter)),
    [complaints, filter],
  );

  const respond = async (status: "in_progress" | "resolved") => {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase
      .from("complaints")
      .update({
        status,
        owner_response: reply.trim() || active.owner_response,
        responded_at: new Date().toISOString(),
        ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
      })
      .eq("id", active.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "resolved" ? "Marked as resolved" : "Response sent");
    qc.invalidateQueries({ queryKey: ["complaints"] });
    setActive(null);
    setReply("");
  };

  return (
    <AppScreen>
      <AppHeader title="Complaints" subtitle={`${complaints.length} reported issues`} />

      <div className="px-4 pt-4">
        <Segmented value={filter} onChange={setFilter} options={FILTERS as any} />
      </div>

      <ScreenSection className="pb-8">
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquareWarning}
            title="No complaints"
            body="Issues raised by your tenants will appear here."
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <AppCard
                key={c.id}
                onClick={() => {
                  setActive(c);
                  setReply(c.owner_response ?? "");
                }}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold tracking-tight text-foreground">
                      {c.title}
                    </p>
                    <p className="truncate text-[12.5px] text-muted-foreground">
                      {c.hostel?.name} · {String(c.category).replace(/_/g, " ")}
                    </p>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </AppCard>
            ))}
          </div>
        )}
      </ScreenSection>

      <AppSheet
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        title={active?.title ?? "Complaint"}
        description={active ? String(active.category).replace(/_/g, " ") : undefined}
      >
        {active && (
          <div className="space-y-4 pb-40">
            <p className="rounded-2xl bg-muted p-4 text-[14px] leading-relaxed text-foreground">
              {active.description}
            </p>
            <div>
              <label className="text-[13px] font-bold text-foreground">Your response</label>
              <textarea
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Let the student know what you're doing about this…"
                className="mt-2 w-full resize-none rounded-2xl bg-muted p-4 text-[14px] outline-none placeholder:text-muted-foreground"
              />
            </div>
            <StickyActionBar>
              <button
                type="button"
                disabled={saving}
                onClick={() => respond("in_progress")}
                className="tap flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-muted text-[15px] font-bold text-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Reply
              </button>
              <AppButton className="flex-1" onClick={() => respond("resolved")} disabled={saving}>
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Mark resolved"}
              </AppButton>
            </StickyActionBar>
          </div>
        )}
      </AppSheet>
    </AppScreen>
  );
}
