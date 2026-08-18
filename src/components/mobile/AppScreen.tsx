import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const ease = [0.32, 0.72, 0, 1] as const;

/**
 * Edge-to-edge mobile screen container with app-style enter transition,
 * safe-area padding and room for the bottom tab bar.
 */
export function AppScreen({
  children,
  className,
  withTabBar = true,
  canvas = true,
}: {
  children: ReactNode;
  className?: string;
  withTabBar?: boolean;
  canvas?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease }}
      className={cn(
        "relative min-h-[100dvh] w-full overflow-x-hidden touch-pan-y",
        canvas ? "bg-app-canvas" : "bg-app-surface",
        withTabBar && "pb-tabbar",
        className,
      )}
    >
      {children}
    </motion.main>
  );
}

export function ScreenSection({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-4 pt-5", className)}>
      {(title || action) && (
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          {title ? (
            <h2 className="truncate text-[17px] font-bold tracking-tight text-foreground">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
