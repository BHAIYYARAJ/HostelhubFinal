import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, EmptyState } from "@/components/mobile/MobileKit";
import InquiryManager from "@/components/owner/InquiryManager";
import { useAuthStore } from "@/store/useAuthStore";
import { MessageSquare } from "lucide-react";

export function OwnerInquiriesScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppScreen>
      <AppHeader title="Inquiries" subtitle="Questions from students" back />
      {!user ? (
        <EmptyState
          icon={MessageSquare}
          title="Sign in as an owner"
          body="Reply to student inquiries about your listings."
          action={<AppButton to="/login">Sign in</AppButton>}
        />
      ) : (
        <ScreenSection className="pb-8">
          <InquiryManager />
        </ScreenSection>
      )}
    </AppScreen>
  );
}
