import { BadgeCheck } from "lucide-react";
import type { OwnerTrustScore } from "../types";

export default function TrustBadge({ trust }: { trust?: OwnerTrustScore }) {
  const score = trust ? Math.round(trust.score) : null;
  const verified = trust?.verified;
  const tone = score == null
    ? "bg-secondary text-muted-foreground border-border"
    : score >= 75
    ? "bg-primary/10 text-primary border-primary/20"
    : score >= 50
    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
    : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      <BadgeCheck className="h-3 w-3" />
      Trust {score ?? "n/a"} {verified ? "· Verified" : ""}
    </span>
  );
}