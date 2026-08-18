import type { ReactNode } from "react";

import { Drawer as Sheet } from "vaul";

import { cn } from "@/lib/utils";

/**
 * Native bottom sheet: drag handle, rounded top corners, safe-area padding.
 */
export function AppSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px]" />
        <Sheet.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] flex max-h-[92dvh] flex-col rounded-t-[28px] bg-app-surface shadow-app-sheet outline-none",
            className,
          )}
        >
          <div className="flex justify-center pt-3">
            <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          {title && (
            <div className="px-5 pb-1 pt-3">
              <Sheet.Title className="text-[19px] font-bold tracking-tight text-foreground">
                {title}
              </Sheet.Title>
              {description && (
                <Sheet.Description className="mt-1 text-[13px] text-muted-foreground">
                  {description}
                </Sheet.Description>
              )}
            </div>
          )}
          <div className="app-scroll flex-1 overflow-y-auto px-5 pb-4 pt-2">{children}</div>
          {footer && (
            <div className="border-t border-app-hairline px-5 pb-[max(1rem,var(--safe-bottom))] pt-3">
              {footer}
            </div>
          )}
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  );
}

/** Sticky bottom action bar (e.g. "Book Now"). */
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="glass-bar fixed inset-x-0 bottom-0 z-50 border-t border-app-hairline px-4 pb-[max(0.75rem,var(--safe-bottom))] pt-3 shadow-app-nav">
      {children}
    </div>
  );
}
