import { useState } from "react";
import { Link, Navigate } from "@/lib/router-compat";
import { ArrowLeft, Loader2, FileText, Download, PenLine } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudentAgreements, type Agreement } from "@/hooks/useAgreements";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadAgreementPdf } from "@/lib/agreementPdf";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  signed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

export default function MyAgreements() {
  const user = useAuthStore((s) => s.user);
  const { data: agreements = [], isLoading } = useStudentAgreements();
  const [signing, setSigning] = useState<Agreement | null>(null);
  const [typed, setTyped] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const openSign = (a: Agreement) => {
    setSigning(a);
    setTyped(user.name || "");
    setAgreed(false);
  };

  const submitSignature = async () => {
    if (!signing) return;
    if (!agreed) { toast.error("Please accept the terms"); return; }
    if (typed.trim().length < 3) { toast.error("Type your full legal name"); return; }
    setSaving(true);
    let ip = "unknown";
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      if (r.ok) ip = (await r.json()).ip || ip;
    } catch {}
    const { error } = await supabase.from("rental_agreements").update({
      student_signature: typed.trim().slice(0, 120),
      student_signed_at: new Date().toISOString(),
      student_signed_ip: ip,
      status: "signed",
    }).eq("id", signing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Agreement signed successfully");
    setSigning(null);
  };

  const download = (a: Agreement) => {
    downloadAgreementPdf({
      agreementId: a.id,
      hostelName: a.hostel?.name || "Hostel",
      hostelLocation: a.hostel ? `${a.hostel.location}, ${a.hostel.city}` : undefined,
      ownerName: a.owner_signature || "Owner",
      studentName: a.student_name,
      studentEmail: a.student_email || undefined,
      studentPhone: a.student_phone || undefined,
      monthlyRent: Number(a.monthly_rent),
      securityDeposit: Number(a.security_deposit),
      startDate: a.start_date,
      endDate: a.end_date,
      terms: a.terms,
      studentSignature: a.student_signature,
      studentSignedAt: a.student_signed_at,
      ownerSignature: a.owner_signature,
      ownerSignedAt: a.owner_signed_at,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-foreground">My Rental Agreements</h1>
        <p className="mb-6 text-sm text-muted-foreground">Review, sign, and download your agreements.</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : agreements.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">No agreements yet</h3>
            <p className="text-sm text-muted-foreground">Owners will share agreements with you here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{a.hostel?.name || "Hostel"}</h4>
                      <Badge className={`capitalize ${STATUS_COLOR[a.status] || ""}`}>{a.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ₹{Number(a.monthly_rent).toLocaleString()}/mo · Deposit ₹{Number(a.security_deposit).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.start_date} → {a.end_date}</p>
                  </div>
                  <div className="flex gap-2">
                    {a.status !== "signed" && (
                      <Button size="sm" onClick={() => openSign(a)} className="gap-1.5">
                        <PenLine className="h-3.5 w-3.5" /> Review & Sign
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => download(a)} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!signing} onOpenChange={(o) => !o && setSigning(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review & sign</DialogTitle>
            <DialogDescription>
              {signing?.hostel?.name} · ₹{signing && Number(signing.monthly_rent).toLocaleString()}/mo
            </DialogDescription>
          </DialogHeader>
          {signing && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs">
                <p className="font-medium">Term: {signing.start_date} → {signing.end_date}</p>
                <p>Security deposit: ₹{Number(signing.security_deposit).toLocaleString()}</p>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border p-3 text-sm whitespace-pre-wrap">
                {signing.terms}
              </div>
              <div className="space-y-1.5">
                <Label>Type your full legal name to sign *</Label>
                <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Your full name" maxLength={120} />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
                <span>I have read and agree to the terms of this rental agreement. I understand that typing my name above constitutes a legally binding electronic signature.</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSigning(null)} disabled={saving}>Cancel</Button>
            <Button onClick={submitSignature} disabled={saving || !agreed} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <PenLine className="h-4 w-4" /> Sign agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}