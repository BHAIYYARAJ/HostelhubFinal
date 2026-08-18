import { Shield } from "lucide-react";
import type { HostelSafetyScore } from "../types";

const STYLES: Record<HostelSafetyScore["level"], string> = {
  excellent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  good: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  average: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  poor: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function SafetyBadge({ safety }: { safety?: HostelSafetyScore }) {
  const level = safety?.level ?? "average";
  const score = safety ? Math.round(safety.score) : null;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STYLES[level]}`}>
      <Shield className="h-3 w-3" />
      Safety {score != null ? `${score}` : "n/a"} · {label}
    </span>
  );
}