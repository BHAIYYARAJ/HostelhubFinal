import { useEffect, useMemo, useState } from "react";
import { Loader2, FilePlus2, Download, FileText, Trash2 } from "lucide-react";
import { useOwnerAgreements, type Agreement } from "@/hooks/useAgreements";
import { useOwnerHostels } from "@/hooks/useHostels";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { downloadAgreementPdf } from "@/lib/agreementPdf";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  signed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

const DEFAULT_TERMS = `1. The Tenant agrees to pay the monthly rent on or before the 5th of each month.
2. The security deposit will be refunded within 30 days of move-out, subject to deductions for damages.
3. The Tenant shall keep the premises clean and abide by all house rules.
4. Either party may terminate this agreement with 30 days written notice.
5. The Tenant shall not sublet the premises without written consent from the Owner.`;

export default function AgreementManager() {
  const user = useAuthStore((s) => s.user);
  const { data: agreements = [], isLoading } = useOwnerAgreements();
  const { data: hostels = [] } = useOwnerHostels(user?.id);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hostel_id: "",
    student_email: "",
    student_name: "",
    student_phone: "",
    monthly_rent: "",
    security_deposit: "",
    start_date: "",
    end_date: "",
    terms: DEFAULT_TERMS,
  });

  useEffect(() => {
    if (open && hostels.length && !form.hostel_id) {
      const h = hostels[0];
      setForm((f) => ({
        ...f,
        hostel_id: h.id,
        monthly_rent: String(h.price),
        security_deposit: String(h.price * 2),
      }));
    }
  }, [open, hostels]);

  const reset = () => setForm({
    hostel_id: "", student_email: "", student_name: "", student_phone: "",
    monthly_rent: "", security_deposit: "", start_date: "", end_date: "", terms: DEFAULT_TERMS,
  });

  const onHostelChange = (id: string) => {
    const h = hostels.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      hostel_id: id,
      monthly_rent: h ? String(h.price) : f.monthly_rent,
      security_deposit: h ? String(h.price * 2) : f.security_deposit,
    }));
  };

  const create = async () => {
    if (!user) return;
    if (!form.hostel_id) { toast.error("Pick a hostel"); return; }
    if (!form.student_email.trim()) { toast.error("Student email is required"); return; }
    if (!form.student_name.trim()) { toast.error("Student name is required"); return; }
    if (!form.start_date || !form.end_date) { toast.error("Start/end date required"); return; }
    if (new Date(form.end_date) <= new Date(form.start_date)) { toast.error("End date must be after start date"); return; }
    const rent = Number(form.monthly_rent), deposit = Number(form.security_deposit);
    if (!rent || rent <= 0) { toast.error("Invalid rent"); return; }

    setSaving(true);
    // Look up student by email in profiles
    const { data: profile, error: lookupErr } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .ilike("email", form.student_email.trim())
      .maybeSingle();
    if (lookupErr) { toast.error(lookupErr.message); setSaving(false); return; }
    if (!profile) {
      toast.error("No HostelHub user found with that email. Ask them to sign up first.");
      setSaving(false); return;
    }

    const { error } = await supabase.from("rental_agreements").insert({
      hostel_id: form.hostel_id,
      owner_id: user.id,
      student_id: profile.id,
      student_name: form.student_name.trim().slice(0, 120),
      student_email: profile.email || form.student_email.trim(),
      student_phone: form.student_phone.trim() || profile.phone || null,
      monthly_rent: rent,
      security_deposit: deposit || 0,
      start_date: form.start_date,
      end_date: form.end_date,
      terms: form.terms.trim().slice(0, 8000),
      status: "sent",
      owner_signature: user.name,
      owner_signed_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Agreement sent to student for signature");
    reset();
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this agreement?")) return;
    const { error } = await supabase.from("rental_agreements").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted");
  };

  const download = (a: Agreement) => {
    downloadAgreementPdf({
      agreementId: a.id,
      hostelName: a.hostel?.name || "Hostel",
      hostelLocation: a.hostel ? `${a.hostel.location}, ${a.hostel.city}` : undefined,
      ownerName: user?.name || "Owner",
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rental Agreements</h3>
          <p className="text-sm text-muted-foreground">Generate and track digital agreements with e-signature.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><FilePlus2 className="h-4 w-4" /> New Agreement</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : agreements.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">No agreements yet</h3>
          <p className="text-sm text-muted-foreground">Create your first rental agreement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agreements.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{a.hostel?.name || "Hostel"}</h4>
                  <Badge className={`capitalize ${STATUS_COLOR[a.status] || ""}`}>{a.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Tenant: <span className="text-foreground">{a.student_name}</span> ({a.student_email})
                </p>
                <p className="text-xs text-muted-foreground">
                  ₹{Number(a.monthly_rent).toLocaleString()}/mo · {a.start_date} → {a.end_date}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => download(a)} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(a.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); } setOpen(o); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Rental Agreement</DialogTitle>
            <DialogDescription>Fill in the details. The student will sign digitally.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Hostel</Label>
              <Select value={form.hostel_id} onValueChange={onHostelChange}>
                <SelectTrigger><SelectValue placeholder="Select hostel" /></SelectTrigger>
                <SelectContent>
                  {hostels.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Student email *</Label>
                <Input type="email" value={form.student_email} onChange={(e) => setForm({ ...form, student_email: e.target.value })} placeholder="student@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Student name *</Label>
                <Input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} placeholder="Full name" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.student_phone} onChange={(e) => setForm({ ...form, student_phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monthly rent (₹)</Label>
                <Input type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Deposit (₹)</Label>
                <Input type="number" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Terms & conditions</Label>
              <Textarea rows={7} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} maxLength={8000} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={create} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}