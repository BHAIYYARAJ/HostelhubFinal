import { supabase } from "@/integrations/supabase/client";
import type { HostelSafetyScore } from "../types";

export const safetyRepo = {
  async listAll(): Promise<HostelSafetyScore[]> {
    const { data, error } = await supabase
      .from("hostel_safety_scores")
      .select("*");
    if (error) throw error;
    return (data ?? []) as unknown as HostelSafetyScore[];
  },

  async get(hostelId: string): Promise<HostelSafetyScore | null> {
    const { data, error } = await supabase
      .from("hostel_safety_scores")
      .select("*")
      .eq("hostel_id", hostelId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as HostelSafetyScore) ?? null;
  },

  async upsert(safety: Partial<HostelSafetyScore> & { hostel_id: string }) {
    const { error } = await supabase
      .from("hostel_safety_scores")
      .upsert(safety as any, { onConflict: "hostel_id" });
    if (error) throw error;
  },
};