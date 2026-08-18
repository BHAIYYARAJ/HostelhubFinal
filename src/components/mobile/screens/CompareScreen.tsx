import { GitCompareArrows, Trash2 } from "lucide-react";

import { AppHeader, HeaderIconButton } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, EmptyState } from "@/components/mobile/MobileKit";
import ComparisonTable from "@/features/recommendations/components/ComparisonTable";
import { useComparison } from "@/features/recommendations/hooks/useComparison";
import { useComparisonStore } from "@/features/recommendations/store/useComparisonStore";

export function CompareScreen() {
  const { items } = useComparison();
  const clear = useComparisonStore((s) => s.clear);

  return (
    <AppScreen>
      <AppHeader
        title="Compare"
        subtitle={`${items.length} shortlisted`}
        back
        actions={
          items.length > 0 ? (
            <HeaderIconButton label="Clear comparison" onClick={clear}>
              <Trash2 className="h-[20px] w-[20px]" />
            </HeaderIconButton>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={GitCompareArrows}
          title="Nothing to compare yet"
          body="Add stays from Smart Picks to see them side by side."
          action={<AppButton to="/recommendations">Open Smart Picks</AppButton>}
        />
      ) : (
        <ScreenSection className="pb-8">
          <div className="app-scroll -mx-4 overflow-x-auto px-4">
            <div className="min-w-[560px]">
              <ComparisonTable items={items} />
            </div>
          </div>
        </ScreenSection>
      )}
    </AppScreen>
  );
}
