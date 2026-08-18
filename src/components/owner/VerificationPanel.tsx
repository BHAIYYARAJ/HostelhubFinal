import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, Upload, FileCheck2, Clock, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

type Status = "pending" | "approved" | "rejected";

interface Request {
  id: string;
  status: Status;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  id_proof_url: string;
  address_proof_url: string;
  selfie_url: string;
  business_doc_url: string | null;
}

type DocKey = "id_proof" | "address_proof" | "selfie" | "business_doc";

const DOC_FIELDS: { key: DocKey; label: string; required: boolean; hint: string }[] = [
  { key: "id_proof", label: "Government ID", required: true, hint: "Aadhaar, PAN, Passport or Driving License" },
  { key: "address_proof", label: "Address Proof", required: true, hint: "Utility bill, rental agreement or bank statement" },
  { key: "selfie", label: "Selfie with ID", required: true, hint: "A clear photo of yourself holding your ID" },
  { key: "business_doc", label: "Business Document", required: false, hint: "Optional — GST, shop license, etc." },
];

const statusMeta: Record<Status, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Under review", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  approved: { label: "Verified", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", icon: XCircle },
};

const VerificationPanel = () => {
  const user = useAuthStore((s) => s.user);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<Partial<Record<DocKey, File>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [profileVerified, setProfileVerified] = useState(false);
  const inputRefs = useRef<Record<DocKey, HTMLInputElement | null>>({
    id_proof: null,
    address_proof: null,
    selfie: null,
    business_doc: null,
  });

  const loadData = async () => {
    if (!user?.id) return;
    const [{ data: req }, { data: prof }] = await Promise.all([
      supabase
        .from("verification_requests")
        .select("id,status,admin_notes,created_at,reviewed_at,id_proof_url,address_proof_url,selfie_url,business_doc_url")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("is_verified").eq("id", user.id).maybeSingle(),
    ]);
    setRequest((req as Request) ?? null);
    setProfileVerified(!!prof?.is_verified);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handlePick = (key: DocKey, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Only images or PDF files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFiles((f) => ({ ...f, [key]: file }));
  };

  const upload = async (key: DocKey, file: File) => {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = `${user!.id}/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("verification-docs")
      .upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (error) throw error;
    return path;
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    const missing = DOC_FIELDS.filter((d) => d.required && !files[d.key]);
    if (missing.length) {
      toast.error(`Please attach: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    setSubmitting(true);
    try {
      const [idPath, addrPath, selfiePath, bizPath] = await Promise.all([
        upload("id_proof", files.id_proof!),
        upload("address_proof", files.address_proof!),
        upload("selfie", files.selfie!),
        files.business_doc ? upload("business_doc", files.business_doc) : Promise.resolve(null),
      ]);

      const { error } = await supabase.from("verification_requests").insert({
        owner_id: user.id,
        id_proof_url: idPath,
        address_proof_url: addrPath,
        selfie_url: selfiePath,
        business_doc_url: bizPath,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Verification request submitted! We'll review it shortly.");
      setFiles({});
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canResubmit = !request || request.status === "rejected";

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${profileVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-primary/10 text-primary"}`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">Owner Verification</h3>
              {profileVerified && (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Verified</Badge>
              )}
              {request && (
                (() => {
                  const M = statusMeta[request.status];
                  const Icon = M.icon;
                  return (
                    <Badge variant="secondary" className={`gap-1 ${M.color}`}>
                      <Icon className="h-3 w-3" /> {M.label}
                    </Badge>
                  );
                })()
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified owners get a trust badge on every listing and rank higher in search results.
              Submit your documents below — most reviews complete within 24–48 hours.
            </p>

            {request && (
              <div className="mt-4 rounded-lg bg-secondary/60 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span>Submitted {format(new Date(request.created_at), "MMM d, yyyy")}</span>
                  {request.reviewed_at && (
                    <span>Reviewed {format(new Date(request.reviewed_at), "MMM d, yyyy")}</span>
                  )}
                </div>
                {request.admin_notes && (
                  <div className="mt-3 flex gap-2 rounded-lg border border-border bg-background p-3 text-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm"><span className="font-medium">Reviewer note:</span> {request.admin_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission form */}
      {canResubmit ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h4 className="mb-1 text-base font-semibold text-foreground">
            {request?.status === "rejected" ? "Resubmit documents" : "Submit your documents"}
          </h4>
          <p className="mb-5 text-sm text-muted-foreground">
            All documents are encrypted and only visible to our verification team.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {DOC_FIELDS.map((d) => {
              const file = files[d.key];
              return (
                <div key={d.key} className="rounded-xl border border-dashed border-border p-4 transition-colors hover:border-primary/40">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {d.label} {d.required && <span className="text-destructive">*</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.hint}</p>
                    </div>
                    {file && <FileCheck2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <input
                    ref={(el) => { inputRefs.current[d.key] = el; }}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handlePick(d.key, e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => inputRefs.current[d.key]?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {file ? file.name.slice(0, 30) : "Choose file"}
                  </button>
                </div>
              );
            })}
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="mt-6 w-full sm:w-auto">
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><ShieldCheck className="mr-2 h-4 w-4" /> Submit for verification</>
            )}
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          {request?.status === "pending"
            ? "Your documents are in review. You'll be notified once approved."
            : "You are verified! Your trust badge is now visible on all your listings."}
        </div>
      )}
    </div>
  );
};

export default VerificationPanel;