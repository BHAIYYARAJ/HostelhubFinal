import { Heart } from "lucide-react";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { HostelCardMobile } from "@/components/mobile/HostelCardMobile";
import { AppButton, EmptyState, SkeletonCards } from "@/components/mobile/MobileKit";
import { useHostels } from "@/hooks/useHostels";
import { useAppStore } from "@/store/useAppStore";

export function SavedScreen() {
  const { data: hostels, isLoading } = useHostels();
  const favorites = useAppStore((s) => s.favorites);
  const saved = (hostels ?? []).filter((h) => favorites.includes(h.id));

  return (
    <AppScreen>
      <AppHeader title="Saved" subtitle={`${saved.length} shortlisted`} back />
      <ScreenSection className="pb-6">
        {isLoading ? (
          <SkeletonCards count={2} />
        ) : saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            body="Tap the heart on any hostel to shortlist it here."
            action={<AppButton to="/">Browse stays</AppButton>}
          />
        ) : (
          <div className="space-y-4">
            {saved.map((h) => (
              <HostelCardMobile key={h.id} hostel={h} />
            ))}
          </div>
        )}
      </ScreenSection>
    </AppScreen>
  );
}
