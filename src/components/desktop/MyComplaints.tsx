import { useState } from "react";
import { Link, Navigate } from "@/lib/router-compat";
import { ArrowLeft, Loader2, MessageSquareWarning, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudentComplaints } from "@/hooks/useComplaints";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ComplaintStatusBadge from "@/components/complaints/ComplaintStatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MyComplaints() {
  const user = useAuthStore((s) => s.user);
  const { data: complaints = [], isLoading } = useStudentComplaints();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const remove = async (id: string) => {
    if (!confirm("Withdraw this complaint?")) return;
    setDeleting(id);
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    setDeleting(null);
    if (error) toast.error(error.message); else toast.success("Complaint withdrawn");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-foreground">My Complaints</h1>
        <p className="mb-6 text-sm text-muted-foreground">Track status and owner responses in real time.</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : complaints.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <MessageSquareWarning className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">No complaints filed</h3>
            <p className="text-sm text-muted-foreground">You can raise a complaint from any hostel page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{c.title}</h4>
                      <ComplaintStatusBadge status={c.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.hostel?.name} · <span className="capitalize">{c.category}</span> ·{" "}
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {c.status !== "resolved" && (
                    <Button size="sm" variant="outline" onClick={() => remove(c.id)} disabled={deleting === c.id} className="text-destructive hover:bg-destructive/10">
                      {deleting === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{c.description}</p>
                {c.owner_response ? (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">OWNER RESPONSE · {c.responded_at && new Date(c.responded_at).toLocaleString()}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{c.owner_response}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs italic text-muted-foreground">Awaiting owner response…</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}