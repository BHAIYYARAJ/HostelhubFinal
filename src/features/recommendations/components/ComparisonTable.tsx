import { X } from "lucide-react";
import { Link } from "@/lib/router-compat";
import type { ScoredHostel } from "../types";
import { compareHostels, type ComparisonMetric } from "../services/comparisonService";
import { useComparisonStore } from "../store/useComparisonStore";

function has(list: string[] | null | undefined, needle: string) {
  return !!list?.some((f) => f.toLowerCase().includes(needle));
}

const ROWS: Array<{
  key: ComparisonMetric;
  label: string;
  render: (i: ScoredHostel) => React.ReactNode;
}> = [
  { key: "price", label: "Rent", render: (i) => `₹${i.hostel.price.toLocaleString()}/mo` },
  { key: "distance", label: "Distance", render: (i) => i.hostel.distance_from_college ?? "—" },
  { key: "facility", label: "Facilities score", render: (i) => `${Math.round(i.subScores.facility * 100)}%` },
  { key: "safety", label: "Safety", render: (i) => i.safety ? `${Math.round(i.safety.score)} · ${i.safety.level}` : "—" },
  { key: "food", label: "Food match", render: (i) => `${Math.round(i.subScores.food * 100)}%` },
  { key: "internet", label: "Internet", render: (i) => has(i.hostel.facilities, "wifi") || has(i.hostel.facilities, "internet") ? "Yes" : "No" },
  { key: "laundry", label: "Laundry", render: (i) => has(i.hostel.facilities, "laundry") ? "Yes" : "No" },
  { key: "parking", label: "Parking", render: (i) => has(i.hostel.facilities, "parking") ? "Yes" : "No" },
  { key: "trust", label: "Owner trust", render: (i) => i.trust ? Math.round(i.trust.score) : "—" },
  { key: "overall", label: "Recommendation score", render: (i) => i.overall },
];

export default function ComparisonTable({ items }: { items: ScoredHostel[] }) {
  const toggle = useComparisonStore((s) => s.toggle);
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Add up to 4 hostels from your recommendations to compare them here.
      </div>
    );
  }
  const { winners, overallWinnerId } = compareHostels(items);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-secondary/60">
          <tr>
            <th className="p-3 text-left font-medium text-muted-foreground">Metric</th>
            {items.map((i) => (
              <th key={i.hostel.id} className="p-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/hostel/${i.hostel.id}`} className="font-semibold text-foreground hover:text-primary">
                      {i.hostel.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{i.hostel.city}</div>
                    {i.hostel.id === overallWinnerId && (
                      <span className="mt-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Best overall
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggle(i.hostel.id)}
                    aria-label="Remove"
                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.key} className="border-t border-border">
              <td className="p-3 font-medium text-muted-foreground">{r.label}</td>
              {items.map((i) => {
                const win = winners[r.key] === i.hostel.id;
                return (
                  <td key={i.hostel.id} className={`p-3 ${win ? "font-semibold text-primary" : "text-foreground"}`}>
                    {r.render(i)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}