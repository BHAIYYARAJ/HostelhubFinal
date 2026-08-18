import { FileText } from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, EmptyState } from "@/components/mobile/MobileKit";
import AgreementManager from "@/components/owner/AgreementManager";
import { useAuthStore } from "@/store/useAuthStore";

export function OwnerAgreementsScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppScreen>
      <AppHeader title="Agreements" subtitle="Create, sign and share" back />
      {!user ? (
        <EmptyState
          icon={FileText}
          title="Sign in as an owner"
          body="Draft and sign rental agreements for confirmed bookings."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : (
        <ScreenSection className="pb-8">
          <AgreementManager />
        </ScreenSection>
      )}
    </AppScreen>
  );
}
