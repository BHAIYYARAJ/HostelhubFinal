import type { Explanation, SubScores } from "../types";

const LABELS: Record<keyof SubScores, string> = {
  budget: "Budget Match",
  distance: "Distance Match",
  facility: "Facilities Match",
  safety: "Safety Match",
  food: "Food Match",
  internet: "Internet Match",
  trust: "Owner Trust",
  rating: "Rating Quality",
  availability: "Availability",
  verified: "Verified Owner",
  popularity: "Review Volume",
};

export default function ExplanationPanel({
  explanation,
  sub,
}: {
  explanation: Explanation;
  sub: SubScores;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(Object.keys(sub) as (keyof SubScores)[]).map((k) => (
          <div key={k} className="rounded-lg border border-border bg-background px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{LABELS[k]}</span>
              <span className="font-semibold text-muted-foreground">{Math.round(sub[k] * 100)}%</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(sub[k] * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      {explanation.reasons.length > 0 && (
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended because
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
            {explanation.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}