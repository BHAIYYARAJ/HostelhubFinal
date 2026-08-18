import { useEffect, useState } from "react";
import { Link, Navigate } from "@/lib/router-compat";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

type Status = "pending" | "approved" | "rejected";

interface Row {
  id: string;
  owner_id: string;
  status: Status;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  id_proof_url: string;
  address_proof_url: string;
  selfie_url: string;
  business_doc_url: string | null;
  owner_name?: string;
  owner_email?: string;
}

const DOC_LABELS: { key: keyof Row; label: string }[] = [
  { key: "id_proof_url", label: "Government ID" },
  { key: "address_proof_url", label: "Address Proof" },
  { key: "selfie_url", label: "Selfie with ID" },
  { key: "business_doc_url", label: "Business Document" },
];

function ReviewCard({
  row,
  onSign,
  note,
  onNoteChange,
  onAct,
  busy,
}: {
  row: Row;
  onSign: (path: string) => Promise<string>;
  note: string;
  onNoteChange: (v: string) => void;
  onAct: (status: "approved" | "rejected") => void;
  busy: boolean;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const next: Record<string, string> = {};
      for (const d of DOC_LABELS) {
        const path = row[d.key] as string | null;
        if (path) next[d.label] = await onSign(path);
      }
      setUrls(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.id]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{row.owner_name || "Unknown owner"}</p>
          <p className="text-xs text-muted-foreground">{row.owner_email || row.owner_id}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted {format(new Date(row.created_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={
            row.status === "approved"
              ? "bg-emerald-100 text-emerald-800"
              : row.status === "rejected"
              ? "bg-rose-100 text-rose-800"
              : "bg-amber-100 text-amber-800"
          }
        >
          {row.status}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DOC_LABELS.map((d) => {
          const url = urls[d.label];
          const path = row[d.key] as string | null;
          if (!path) {
            return (
              <div key={d.label} className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                {d.label}: not provided
              </div>
            );
          }
          const isPdf = path.toLowerCase().endsWith(".pdf");
          return (
            <a
              key={d.label}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary/40"
            >
              <div className="flex h-32 items-center justify-center bg-secondary/50">
                {!url ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : isPdf ? (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <img src={url} alt={d.label} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="px-3 py-2 text-xs font-medium text-foreground">{d.label}</div>
            </a>
          );
        })}
      </div>

      {row.status === "pending" ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Notes for the owner (shown on rejection)…"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onAct("approved")} disabled={busy} className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Approve & Verify
            </Button>
            <Button onClick={() => onAct("rejected")} disabled={busy} variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10">
              <XCircle className="h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      ) : (
        row.admin_notes && (
          <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm text-foreground">
            <span className="font-medium">Note:</span> {row.admin_notes}
          </p>
        )
      )}
    </div>
  );
}

const AdminVerification = () => {
  const user = useAuthStore((s) => s.user);
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("pending");
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("verification_requests")
      .select("id,owner_id,status,admin_notes,created_at,reviewed_at,id_proof_url,address_proof_url,selfie_url,business_doc_url")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const list = (data || []) as Row[];
    const ids = Array.from(new Set(list.map((r) => r.owner_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map = new Map((profs || []).map((p: any) => [p.id, p]));
      list.forEach((r) => {
        const p: any = map.get(r.owner_id);
        if (p) {
          r.owner_name = p.full_name;
          r.owner_email = p.email;
        }
      });
    }
    setRows(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, filter]);

  const getSignedUrl = async (path: string) => {
    if (signedUrls[path]) return signedUrls[path];
    const { data } = await supabase.storage
      .from("verification-docs")
      .createSignedUrl(path, 60 * 30);
    const url = data?.signedUrl || "";
    if (url) setSignedUrls((s) => ({ ...s, [path]: url }));
    return url;
  };

  const act = async (row: Row, status: "approved" | "rejected") => {
    setActingId(row.id);
    const { error } = await supabase
      .from("verification_requests")
      .update({
        status,
        admin_notes: notes[row.id] || null,
        reviewed_by: user?.id ?? null,
      })
      .eq("id", row.id);
    setActingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Owner verified" : "Request rejected");
    load();
  };

  if (!user) return <Navigate to="/login" replace />;
  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Verification Reviews</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-8">
        <div className="flex gap-1 rounded-xl bg-secondary p-1">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No requests to show.
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <ReviewCard
                key={r.id}
                row={r}
                onSign={getSignedUrl}
                note={notes[r.id] || ""}
                onNoteChange={(v) => setNotes((s) => ({ ...s, [r.id]: v }))}
                onAct={(status) => act(r, status)}
                busy={actingId === r.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminVerification;