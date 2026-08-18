import { supabase } from "@/integrations/supabase/client";
import type { StudentPreference, ScoredHostel } from "../types";

export const historyRepo = {
  async record(params: {
    studentId: string;
    preference: StudentPreference;
    recommended: ScoredHostel[];
  }) {
    const snapshot = params.recommended.slice(0, 10).map((s) => ({
      hostel_id: s.hostel.id,
      overall: s.overall,
      confidence: s.confidence,
    }));
    const { error } = await supabase.from("recommendation_history").insert({
      student_id: params.studentId,
      preference_snapshot: params.preference as any,
      recommended_hostels: snapshot as any,
    });
    if (error) throw error;
  },

  async list(studentId: string) {
    const { data, error } = await supabase
      .from("recommendation_history")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async listAll() {
    const { data, error } = await supabase
      .from("recommendation_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data ?? [];
  },
};