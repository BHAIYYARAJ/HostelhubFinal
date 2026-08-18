import type { HostelSafetyScore } from "../../types";

export function scoreSafety(safety?: HostelSafetyScore | null): number {
  if (!safety) return 0.5;
  return Math.min(1, Math.max(0, safety.score / 100));
}

export function computeSafety(s: Omit<HostelSafetyScore, "score" | "level">): {
  score: number;
  level: HostelSafetyScore["level"];
} {
  const weights = {
    has_cctv: 22,
    has_security_guard: 22,
    has_fire_safety: 18,
    nearby_hospital: 19,
    nearby_police: 19,
  } as const;
  const score = (Object.keys(weights) as (keyof typeof weights)[]).reduce(
    (acc, k) => acc + ((s as any)[k] ? weights[k] : 0),
    0
  );
  const level: HostelSafetyScore["level"] =
    score >= 85 ? "excellent" : score >= 65 ? "good" : score >= 40 ? "average" : "poor";
  return { score, level };
}