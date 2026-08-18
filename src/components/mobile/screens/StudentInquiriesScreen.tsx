import { FileQuestion, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { EmptyState } from "@/components/mobile/MobileKit";
import { useStudentInquiries } from "@/hooks/useStudentInquiries";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const statusMeta = {
  pending: { label: "Pending", icon: Clock3, className: "bg-amber-100 text-amber-700" },
  replied: { label: "Replied", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", icon: XCircle, className: "bg-muted text-muted-foreground" },
} as const;

export function StudentInquiriesScreen() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading } = useStudentInquiries();
  return (
    <AppScreen>
      <AppHeader title="Inquiries" subtitle="Your formal hostel inquiries" back />
      {!user ? (
        <EmptyState icon={FileQuestion} title="Sign in to view inquiries" body="Your inquiries and owner replies will appear here." />
      ) : (
        <ScreenSection className="pb-8">
          {isLoading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading inquiries...</p> : data.length === 0 ? (
            <EmptyState icon={FileQuestion} title="No inquiries yet" body="Send a formal inquiry from a hostel listing to see it here." />
          ) : (
            <div className="space-y-3">
              {data.map((inquiry) => {
                const meta = statusMeta[inquiry.status];
                const Icon = meta.icon;
                return (
                  <article key={inquiry.id} className="rounded-3xl bg-app-surface p-4 shadow-app-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold text-foreground">{inquiry.subject}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">{inquiry.hostel?.name ?? "Hostel"}{inquiry.hostel?.city ? ` · ${inquiry.hostel.city}` : ""}</p>
                      </div>
                      <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold", meta.className)}>
                        <Icon className="h-3.5 w-3.5" />{meta.label}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-[13px] leading-5 text-muted-foreground">{inquiry.message}</p>
                    {inquiry.reply && (
                      <div className="mt-3 rounded-2xl bg-primary/5 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Owner reply</p>
                        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-foreground">{inquiry.reply}</p>
                      </div>
                    )}
                    <p className="mt-3 text-[10px] text-muted-foreground">{format(new Date(inquiry.updated_at || inquiry.created_at), "dd MMM yyyy, h:mm a")}</p>
                  </article>
                );
              })}
            </div>
          )}
        </ScreenSection>
      )}
    </AppScreen>
  );
}
