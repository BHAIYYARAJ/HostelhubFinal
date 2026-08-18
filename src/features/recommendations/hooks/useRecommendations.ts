import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHostels } from "@/hooks/useHostels";
import { useAuthStore } from "@/store/useAuthStore";
import { safetyRepo } from "../repositories/safetyRepo";
import { trustRepo } from "../repositories/trustRepo";
import { runRecommendationEngine } from "../services/recommendationEngine";
import { historyRepo } from "../repositories/historyRepo";
import { usePreferences } from "./usePreferences";
import type { EngineResult } from "../types";

export function useRecommendations() {
  const user = useAuthStore((s) => s.user);
  const prefQ = usePreferences();
  const hostelsQ = useHostels();
  const qc = useQueryClient();

  const safetyQ = useQuery({
    queryKey: ["aphr", "safety"],
    queryFn: () => safetyRepo.listAll(),
  });
  const trustQ = useQuery({
    queryKey: ["aphr", "trust"],
    queryFn: () => trustRepo.listAll(),
  });

  // Recalculate automatically when live safety / trust / review data changes.
  useEffect(() => {
    const channel = supabase
      .channel(`aphr-live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_safety_scores" }, () =>
        qc.invalidateQueries({ queryKey: ["aphr", "safety"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "owner_trust_scores" }, () =>
        qc.invalidateQueries({ queryKey: ["aphr", "trust"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () =>
        qc.invalidateQueries({ queryKey: ["hostels"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const ready =
    !!prefQ.data && !!hostelsQ.data && !!safetyQ.data && !!trustQ.data;

  const result: EngineResult = useMemo(() => {
    if (!ready || !prefQ.data) return { items: [], appliedRadiusKm: null, expanded: false };
    const safetyMap = new Map((safetyQ.data ?? []).map((s) => [s.hostel_id, s]));
    const trustMap = new Map((trustQ.data ?? []).map((t) => [t.owner_id, t]));
    return runRecommendationEngine({
      preference: prefQ.data,
      hostels: hostelsQ.data ?? [],
      safetyByHostel: safetyMap,
      trustByOwner: trustMap,
    });
  }, [ready, prefQ.data, hostelsQ.data, safetyQ.data, trustQ.data]);

  const recommendations = result.items;

  const recordHistory = async () => {
    if (!user || !prefQ.data || recommendations.length === 0) return;
    try {
      await historyRepo.record({
        studentId: user.id,
        preference: prefQ.data,
        recommended: recommendations,
      });
    } catch {
      /* ignore */
    }
  };

  return {
    recommendations,
    appliedRadiusKm: result.appliedRadiusKm,
    radiusExpanded: result.expanded,
    preference: prefQ.data,
    isLoading:
      prefQ.isLoading || hostelsQ.isLoading || safetyQ.isLoading || trustQ.isLoading,
    error: prefQ.error || hostelsQ.error || safetyQ.error || trustQ.error,
    recordHistory,
  };
}