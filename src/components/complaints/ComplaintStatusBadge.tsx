import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  in_progress: { label: "In Progress", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  resolved: { label: "Resolved", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
};

export default function ComplaintStatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] ?? MAP.open;
  return <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>;
}