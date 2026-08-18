import { useRecAnalytics } from "../hooks/useRecAnalytics";
import { Loader2, Sparkles, TrendingUp, Users, Star } from "lucide-react";

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const { data, isLoading } = useRecAnalytics();
  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={<Sparkles className="h-4 w-4" />} label="Total recommendations" value={data.totalRecommendations} />
        <Card icon={<TrendingUp className="h-4 w-4" />} label="Acceptance rate" value={`${Math.round(data.acceptanceRate * 100)}%`} />
        <Card icon={<Users className="h-4 w-4" />} label="Avg. student budget" value={`₹${Math.round(data.avgBudget).toLocaleString()}`} />
        <Card icon={<Star className="h-4 w-4" />} label="Avg. score" value={Math.round(data.avgScore)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Most recommended hostel</div>
          <div className="mt-1 font-mono text-sm text-foreground">
            {data.mostRecommendedHostelId ?? "—"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Top student priority</div>
          <div className="mt-1 text-sm font-semibold capitalize text-foreground">
            {data.mostImportantPreference ?? "—"}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 text-sm font-semibold text-foreground">Monthly recommendation trend</div>
        {data.monthlyTrend.length === 0 ? (
          <div className="text-sm text-muted-foreground">No data yet.</div>
        ) : (
          <div className="flex items-end gap-2">
            {data.monthlyTrend.map((m) => {
              const max = Math.max(...data.monthlyTrend.map((x) => x.count), 1);
              const pct = (m.count / max) * 100;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="h-24 w-full overflow-hidden rounded-md bg-secondary">
                    <div className="h-full w-full bg-primary/70" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}