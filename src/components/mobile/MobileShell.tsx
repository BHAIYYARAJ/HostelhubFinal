import type { ReactNode } from "react";

import { TabBar } from "@/components/mobile/TabBar";

/**
 * Wraps a mobile screen with the persistent bottom tab bar.
 */
export function MobileShell({
  children,
  variant = "student",
}: {
  children: ReactNode;
  variant?: "student" | "owner";
}) {
  return (
    <>
      {children}
      <TabBar variant={variant} />
    </>
  );
}
