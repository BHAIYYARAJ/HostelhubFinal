import { ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, EmptyState } from "@/components/mobile/MobileKit";
import VerificationPanel from "@/components/owner/VerificationPanel";
import { useAuthStore } from "@/store/useAuthStore";

export function OwnerVerificationScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppScreen>
      <AppHeader title="Verification" subtitle="Get the verified owner badge" back />
      {!user ? (
        <EmptyState
          icon={ShieldCheck}
          title="Sign in as an owner"
          body="Upload your documents to get verified."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : (
        <ScreenSection className="pb-8">
          <VerificationPanel />
        </ScreenSection>
      )}
    </AppScreen>
  );
}
