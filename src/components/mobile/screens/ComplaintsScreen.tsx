import { Loader2, MessageSquareWarning } from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, AppCard, EmptyState, StatusPill } from "@/components/mobile/MobileKit";
import { useStudentComplaints } from "@/hooks/useComplaints";
import { useAuthStore } from "@/store/useAuthStore";

export function ComplaintsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: complaints, isLoading } = useStudentComplaints();

  return (
    <AppScreen>
      <AppHeader title="Complaints" subtitle="Issues you've reported" back />

      {!user ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="Sign in to track complaints"
          body="Raise issues about your stay and follow the owner's response."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !complaints?.length ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints raised"
          body="Open a hostel page and tap 'Raise a complaint' if something needs attention."
          action={<AppButton to="/">Browse stays</AppButton>}
        />
      ) : (
        <ScreenSection className="pb-6">
          <div className="space-y-4">
            {complaints.map((c: any) => (
              <AppCard key={c.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                      {c.title}
                    </p>
                    <p className="truncate text-[12px] capitalize text-muted-foreground">
                      {c.category} · {c.hostel?.name ?? "Hostel"}
                    </p>
                  </div>
                  <StatusPill status={String(c.status ?? "open")} />
                </div>

                <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                  {c.description}
                </p>

                {c.owner_response && (
                  <div className="mt-3 rounded-2xl bg-muted/70 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                      Owner response
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{c.owner_response}</p>
                  </div>
                )}

                <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
                  Raised{" "}
                  {new Date(c.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </AppCard>
            ))}
          </div>
        </ScreenSection>
      )}
    </AppScreen>
  );
}
