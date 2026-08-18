import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { useNavigate } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

/**
 * Native-style top header: hairline glass bar, status-bar safe area, optional
 * back chevron and trailing actions.
 */
export function AppHeader({
  title,
  subtitle,
  back = false,
  onBack,
  actions,
  large = false,
  className,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
  large?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "glass-bar sticky top-0 z-40 border-b border-app-hairline pt-safe",
        className,
      )}
    >
      <div className="grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2">
        {back ? (
          <button
            type="button"
            aria-label="Go back"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="tap grid h-10 w-10 shrink-0 place-items-center rounded-full text-foreground active:bg-muted"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
          </button>
        ) : (
          <span className="w-2" />
        )}

        <div className="min-w-0 text-center">
          {!large && (
            <>
              <p className="truncate text-[16px] font-bold tracking-tight text-foreground">{title}</p>
              {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 pr-1">{actions}</div>
      </div>

      {large && (
        <div className="px-4 pb-3">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}

export function HeaderIconButton({
  children,
  onClick,
  label,
  badge,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="tap relative grid h-10 w-10 place-items-center rounded-full text-foreground active:bg-muted"
    >
      {children}
      {!!badge && badge > 0 && (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
