import { supabase } from "@/integrations/supabase/client";
import type { SubScores, Weights } from "../types";

export interface CachedScoreRow {
  student_id: string;
  hostel_id: string;
  overall: number;
  sub_scores: SubScores;
  weights: Weights;
  confidence: number;
  generated_at: string;
}

export const scoresRepo = {
  async listForStudent(studentId: string) {
    const { data, error } = await supabase
      .from("recommendation_scores")
      .select("*")
      .eq("student_id", studentId);
    if (error) throw error;
    return (data ?? []) as unknown as CachedScoreRow[];
  },

  async upsertMany(rows: Array<Omit<CachedScoreRow, "generated_at">>) {
    if (!rows.length) return;
    const { error } = await supabase
      .from("recommendation_scores")
      .upsert(rows as any, { onConflict: "student_id,hostel_id" });
    if (error) throw error;
  },

  async clearForStudent(studentId: string) {
    const { error } = await supabase
      .from("recommendation_scores")
      .delete()
      .eq("student_id", studentId);
    if (error) throw error;
  },
};