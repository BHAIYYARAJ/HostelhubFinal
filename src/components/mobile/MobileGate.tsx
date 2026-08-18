import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

import { useDeviceLayout } from "@/hooks/use-device-layout";

/**
 * Renders the native-style mobile app on phones and the untouched desktop
 * website everywhere else. While the viewport is still unknown (SSR + first
 * paint) the desktop tree is rendered for SEO, with a phone-only splash on top
 * so mobile users never see a flash of website chrome.
 */
export function MobileGate({ mobile, desktop }: { mobile: ReactNode; desktop: ReactNode }) {
  const layout = useDeviceLayout();

  if (layout === "mobile") return <>{mobile}</>;

  return (
    <>
      {desktop}
      {layout === "unknown" && <AppSplash />}
    </>
  );
}

function AppSplash() {
  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-background md:hidden">
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary shadow-app-float">
          <Building2 className="h-8 w-8 text-primary-foreground" strokeWidth={2.4} />
        </div>
        <p className="text-sm font-semibold tracking-tight text-foreground">HostelHub</p>
      </div>
    </div>
  );
}
