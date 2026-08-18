import { useState } from "react";
import { CalendarDays, Download, FileText, Loader2, PenLine, Share2 } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppSheet } from "@/components/mobile/AppSheet";
import { AppButton, AppCard, EmptyState, StatusPill } from "@/components/mobile/MobileKit";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useStudentAgreements, type Agreement } from "@/hooks/useAgreements";
import { supabase } from "@/integrations/supabase/client";
import {
  downloadAgreementPdf,
  generateAgreementPdf,
  type AgreementPdfData,
} from "@/lib/agreementPdf";
import { useAuthStore } from "@/store/useAuthStore";

function toPdfData(a: Agreement): AgreementPdfData {
  return {
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
  };
}

export function AgreementsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: agreements, isLoading } = useStudentAgreements();

  const [signing, setSigning] = useState<Agreement | null>(null);
  const [typed, setTyped] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const openSign = (a: Agreement) => {
    setSigning(a);
    setTyped(user?.name || "");
    setAgreed(false);
  };

  const submitSignature = async () => {
    if (!signing) return;
    if (!agreed) {
      toast.error("Please accept the terms");
      return;
    }
    if (typed.trim().length < 3) {
      toast.error("Type your full legal name");
      return;
    }
    setSaving(true);
    let ip = "unknown";
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      if (r.ok) ip = (await r.json()).ip || ip;
    } catch {
      /* offline is fine */
    }
    const { error } = await supabase
      .from("rental_agreements")
      .update({
        student_signature: typed.trim().slice(0, 120),
        student_signed_at: new Date().toISOString(),
        student_signed_ip: ip,
        status: "signed",
      })
      .eq("id", signing.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agreement signed");
    setSigning(null);
  };

  const share = async (a: Agreement) => {
    const data = toPdfData(a);
    try {
      const blob = generateAgreementPdf(data).output("blob");
      const file = new File([blob], `agreement-${a.id.slice(0, 8)}.pdf`, {
        type: "application/pdf",
      });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: data.hostelName, text: "Rental agreement" });
        return;
      }
      downloadAgreementPdf(data);
      toast.success("Agreement downloaded");
    } catch {
      toast.error("Couldn't share the agreement");
    }
  };

  return (
    <AppScreen>
      <AppHeader title="Agreements" subtitle="Your rental documents" back />

      {!user ? (
        <EmptyState
          icon={FileText}
          title="Sign in to view agreements"
          body="Rental agreements from your confirmed bookings appear here."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !agreements?.length ? (
        <EmptyState
          icon={FileText}
          title="No agreements yet"
          body="Once an owner confirms your booking, the rental agreement shows up here."
          action={<AppButton to="/my-bookings">View bookings</AppButton>}
        />
      ) : (
        <ScreenSection className="pb-6">
          <div className="space-y-4">
            {agreements.map((a) => (
              <AppCard key={a.id} padded={false}>
                <div className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                        {a.hostel?.name ?? "Rental agreement"}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {a.hostel?.location}
                        {a.hostel?.city ? `, ${a.hostel.city}` : ""}
                      </p>
                    </div>
                    <StatusPill status={String(a.status ?? "pending")} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Info label="Start" value={fmt(a.start_date)} />
                    <Info label="End" value={fmt(a.end_date)} />
                    <Info
                      label="Monthly rent"
                      value={a.monthly_rent ? `₹${Number(a.monthly_rent).toLocaleString("en-IN")}` : "—"}
                    />
                    <Info
                      label="Deposit"
                      value={
                        a.security_deposit
                          ? `₹${Number(a.security_deposit).toLocaleString("en-IN")}`
                          : "—"
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-app-hairline border-t border-app-hairline">
                  <button
                    type="button"
                    onClick={() => openSign(a)}
                    disabled={a.status === "signed"}
                    className="tap flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-foreground disabled:opacity-40"
                  >
                    <PenLine className="h-4 w-4" />
                    {a.status === "signed" ? "Signed" : "Review & sign"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadAgreementPdf(toPdfData(a))}
                    className="tap flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-foreground"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => share(a)}
                    className="tap flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-primary"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </AppCard>
            ))}
          </div>
        </ScreenSection>
      )}

      <AppSheet
        open={!!signing}
        onOpenChange={(o) => !o && setSigning(null)}
        title="Review & sign"
        description={
          signing
            ? `${signing.hostel?.name ?? "Agreement"} · ₹${Number(signing.monthly_rent).toLocaleString("en-IN")}/mo`
            : undefined
        }
        footer={
          <AppButton onClick={submitSignature} disabled={saving || !agreed}>
            {saving ? "Signing…" : "Sign agreement"}
          </AppButton>
        }
      >
        {signing && (
          <div className="space-y-4 pb-2">
            <div className="rounded-2xl bg-muted/60 p-3 text-[12px] text-muted-foreground">
              <p className="font-semibold text-foreground">
                Term: {fmt(signing.start_date)} → {fmt(signing.end_date)}
              </p>
              <p className="mt-0.5">
                Security deposit: ₹{Number(signing.security_deposit).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="app-scroll max-h-56 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-app-hairline p-3 text-[13px] leading-relaxed text-muted-foreground">
              {signing.terms}
            </div>
            <div>
              <p className="mb-1.5 text-[12px] font-bold text-foreground">
                Type your full legal name to sign
              </p>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Your full name"
                maxLength={120}
                className="h-12 rounded-2xl"
              />
            </div>
            <label className="flex items-start gap-3 text-[12px] leading-relaxed text-muted-foreground">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
              <span>
                I have read and agree to the terms of this rental agreement. Typing my name
                constitutes a legally binding electronic signature.
              </span>
            </label>
          </div>
        )}
      </AppSheet>
    </AppScreen>
  );
}

function fmt(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        <CalendarDays className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
