import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold tracking-tight",
        active
          ? "bg-foreground text-background"
          : "border border-app-hairline bg-app-surface text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="app-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">{children}</div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-2xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "tap flex-1 rounded-xl px-3 py-2 text-[13px] font-semibold tracking-tight transition-colors",
            value === o.value
              ? "bg-app-surface text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AppCard({
  children,
  className,
  padded = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-3xl bg-app-surface shadow-app-card",
        padded && "p-4",
        onClick && "tap cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}


export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "primary";
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-4 shadow-app-card",
        tone === "primary" ? "bg-primary text-primary-foreground" : "bg-app-surface",
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "mb-2 h-5 w-5",
            tone === "primary" ? "text-primary-foreground/80" : "text-primary",
          )}
        />
      )}
      <p className="text-[22px] font-extrabold leading-none tracking-tight">{value}</p>
      <p
        className={cn(
          "mt-1 text-[11px] font-medium",
          tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function ListRow({
  icon: Icon,
  title,
  subtitle,
  to,
  onClick,
  trailing,
  danger,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  to?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
}) {
  const inner = (
    <>
      {Icon && (
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
            danger ? "bg-destructive/10 text-destructive" : "bg-coral-light text-primary",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "block truncate text-[15px] font-semibold tracking-tight",
            danger ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-[12px] text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {trailing ?? <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />}
    </>
  );

  const cls = "tap flex w-full items-center gap-3 px-4 py-3";

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function ListGroup({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-app-hairline overflow-hidden rounded-3xl bg-app-surface shadow-app-card">
      {children}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-coral-light text-primary">
        <Icon className="h-8 w-8" />
      </span>
      <p className="mt-4 text-[17px] font-bold tracking-tight text-foreground">{title}</p>
      {body && <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-3xl bg-app-surface shadow-app-card">
          <div className="h-40 w-full bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded-full bg-muted" />
            <div className="h-3 w-1/3 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: string;
}) {
  const tone =
    status === "confirmed" || status === "resolved" || status === "active" || status === "signed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "pending" || status === "in_progress" || status === "open"
        ? "bg-amber-50 text-amber-700"
        : status === "rejected" || status === "cancelled"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", tone)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

/** Big touch-friendly primary button. */
export function AppButton({
  children,
  onClick,
  to,
  variant = "primary",
  disabled,
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const cls = cn(
    "tap grid h-14 w-full place-items-center rounded-2xl text-[15px] font-bold tracking-tight disabled:opacity-50",
    variant === "primary" && "bg-primary text-primary-foreground shadow-app-float",
    variant === "secondary" && "border border-app-hairline bg-app-surface text-foreground",
    variant === "ghost" && "text-primary",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
