import { feedbackRepo } from "../repositories/feedbackRepo";
import { historyRepo } from "../repositories/historyRepo";

export interface AdminAnalytics {
  totalRecommendations: number;
  acceptanceRate: number; // booked / recommended
  avgBudget: number;
  avgScore: number;
  mostRecommendedHostelId: string | null;
  mostImportantPreference: "safety" | "budget" | "distance" | "facility" | null;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export async function loadAdminAnalytics(): Promise<AdminAnalytics> {
  const [history, feedback] = await Promise.all([
    historyRepo.listAll(),
    feedbackRepo.listAll(),
  ]);

  const hostelCounts = new Map<string, number>();
  let totalRecommendations = 0;
  let budgetSum = 0;
  let budgetN = 0;
  let scoreSum = 0;
  let scoreN = 0;
  const importanceTotals = { safety: 0, budget: 0, distance: 0, facility: 0 };

  history.forEach((row: any) => {
    const rec: Array<{ hostel_id: string; overall: number }> = row.recommended_hostels ?? [];
    totalRecommendations += rec.length;
    rec.forEach((r) => {
      hostelCounts.set(r.hostel_id, (hostelCounts.get(r.hostel_id) ?? 0) + 1);
      scoreSum += r.overall;
      scoreN++;
    });
    const p = row.preference_snapshot ?? {};
    if (typeof p.budget_max === "number") {
      budgetSum += p.budget_max;
      budgetN++;
    }
    importanceTotals.safety += p.importance_safety ?? 0;
    importanceTotals.budget += p.importance_budget ?? 0;
    importanceTotals.distance += p.importance_distance ?? 0;
    importanceTotals.facility += p.importance_facility ?? 0;
  });

  const bookings = feedback.filter((f: any) => f.action === "booked").length;
  const acceptanceRate = totalRecommendations
    ? bookings / totalRecommendations
    : 0;

  const mostRecommendedHostelId =
    [...hostelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const mostImportantPreference =
    (Object.entries(importanceTotals).sort((a, b) => b[1] - a[1])[0]?.[0] as
      | AdminAnalytics["mostImportantPreference"]) ?? null;

  const buckets = new Map<string, number>();
  history.forEach((row: any) => {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });
  const monthlyTrend = [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  return {
    totalRecommendations,
    acceptanceRate,
    avgBudget: budgetN ? budgetSum / budgetN : 0,
    avgScore: scoreN ? scoreSum / scoreN : 0,
    mostRecommendedHostelId,
    mostImportantPreference,
    monthlyTrend,
  };
}